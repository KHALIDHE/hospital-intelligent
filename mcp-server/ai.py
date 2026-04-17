# ============================================================
# ai.py — TRUE MCP via Structured JSON Prompting
# ============================================================
# Gemma3:4b does not support Ollama native tools API.
# Solution: prompt Gemma3 to respond with JSON tool selection.
#
# Flow:
#   Round 1: Send tools list as text → Gemma3 picks one as JSON
#   Round 2: Python executes chosen tool → gets real DB data  
#   Round 3: Send data back → Gemma3 generates natural answer
#
# Gemma3 still DECIDES which tool to call → still true MCP.
# ============================================================
# ============================================================
# ai.py — TRUE MCP via Structured JSON Prompting
# ============================================================
import ollama
import json
import os
import re
from dotenv import load_dotenv
from tools import execute_tool, get_tools_for_role

load_dotenv()

MODEL = os.getenv('OLLAMA_MODEL', 'gemma3:4b')

# ← ADD THIS — tells ollama library to use Docker service name
client = ollama.Client(host=os.getenv('OLLAMA_HOST', 'http://ollama:11434'))

# ── Casual messages that need NO tools ───────────────────────
# If message matches these → skip tool selection entirely
# Answer directly as a helpful assistant
CASUAL_PATTERNS = [
    r'^(hi|hello|hey|salam|bonjour|bonsoir|salut)[\s!?.]*$',
    r'^(thanks|thank you|merci|شكرا)[\s!?.]*$',
    r'^(ok|okay|good|great|perfect|nice)[\s!?.]*$',
    r'^(what|what\?|huh|quoi|pardon)[\s!?.]*$',
    r'^(how are you|كيف حالك|comment vas)[\s!?.]*$',
    r'^(bye|goodbye|au revoir)[\s!?.]*$',
    r'^.{1,3}$',  # very short messages (1-3 chars)
]


def is_casual_message(message: str) -> bool:
    """Returns True if message is a greeting/casual — no tools needed."""
    msg = message.strip().lower()
    for pattern in CASUAL_PATTERNS:
        if re.match(pattern, msg, re.IGNORECASE):
            return True
    return False


def get_casual_reply(message: str, role: str) -> str:
    """Direct answer for casual messages — no DB needed."""
    role_context = {
        'doctor':  "You are assisting a doctor. They can ask about patients, appointments, and critical alerts.",
        'nurse':   "You are assisting a nurse. They can ask about OR beds and doctor availability.",
        'admin':   "You are assisting a hospital administrator. They have full access to hospital data.",
        'patient': "You are assisting a patient. They can ask about their appointments and medical profile.",
    }

    try:
        response = client.chat(
            model    = MODEL,
            messages = [{
                "role":    "user",
                "content": f"""You are a friendly AI assistant for Hôpital Intelligent hospital.
{role_context.get(role, '')}

User said: "{message}"

Reply naturally and briefly (1-2 sentences max).
Mention what kind of questions you can help with.
No markdown, no bullet points."""
            }],
            options = {'temperature': 0.5, 'num_predict': 80}
        )
        return response['message']['content']
    except Exception as e:
        return f"Hello! I'm your hospital AI assistant. How can I help you today?"


def build_tool_selection_prompt(user_message: str, role: str, user_id: int, tools: list) -> str:

    tools_text = ""
    for t in tools:
        fn     = t['function']
        name   = fn['name']
        desc   = fn['description']
        params = list(fn['parameters'].get('properties', {}).keys())
        tools_text += f"\n- {name}({', '.join(params)}): {desc}"

    return f"""You are a hospital AI assistant. You have access to these tools:
{tools_text}

User role: {role.upper()}
User ID: {user_id}
User message: "{user_message}"

Your task: Decide which tool to call to answer this message.

Respond with ONLY a JSON object in this exact format:
{{"tool": "tool_name_here", "args": {{"param_name": param_value}}}}

Rules:
- Pick exactly ONE tool that best answers the question
- For doctor tools: always use doctor_user_id = {user_id}
- For patient tools: always use user_id = {user_id}
- For tools with no params: use {{"args": {{}}}}
- Respond with ONLY the JSON — no explanation, no text before or after

JSON response:"""


def extract_json_from_response(text: str) -> dict | None:

    cleaned = re.sub(r'```(?:json)?', '', text).strip()
    cleaned = cleaned.replace('```', '').strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    return None


def ask_gemma(user_message: str, role: str, user_id: int) -> str:

    # ── Step 0: Casual message check ─────────────────────────
    # Greetings / short messages don't need any DB tools
    if is_casual_message(user_message):
        print(f"[MCP] Casual message detected — skipping tools")
        return get_casual_reply(user_message, role)

    # Get tools allowed for this role only
    tools = get_tools_for_role(role)

    if not tools:
        return "No tools available for your role."

    # ── ROUND 1: Ask Gemma3 which tool to call ────────────────
    tool_selection_prompt = build_tool_selection_prompt(
        user_message = user_message,
        role         = role,
        user_id      = user_id,
        tools        = tools
    )

    try:
        round1 = client.chat(
            model    = MODEL,
            messages = [{"role": "user", "content": tool_selection_prompt}],
            options  = {'temperature': 0.1, 'num_predict': 100}
        )
        raw_response = round1['message']['content']
        print(f"\n[MCP Round 1] Gemma3 tool selection: {raw_response}")

    except Exception as e:
        return f"Error in tool selection: {str(e)}"

    # ── Parse Gemma3's tool selection ─────────────────────────
    tool_decision = extract_json_from_response(raw_response)

    if not tool_decision or 'tool' not in tool_decision:
        print("[MCP] No tool selected — answering directly")
        try:
            direct =client.chat (
                model    = MODEL,
                messages = [{
                    "role":    "user",
                    "content": f"You are a hospital AI assistant for {role}. Answer briefly: {user_message}"
                }],
                options = {'temperature': 0.3, 'num_predict': 150}
            )
            return direct['message']['content']
        except Exception as e:
            return f"Error: {str(e)}"

    # ── ROUND 2: Execute the tool Gemma3 chose ────────────────
    tool_name = tool_decision.get('tool')
    tool_args = tool_decision.get('args', {})

    # Inject user_id from JWT — cannot be faked by user
    if tool_name in ['get_my_patients', 'get_critical_patients',
                     'get_today_appointments', 'get_all_appointments']:
        tool_args['doctor_user_id'] = user_id

    elif tool_name in ['get_my_profile', 'get_my_appointments']:
        tool_args['user_id'] = user_id

    print(f"[MCP Round 2] Tool: {tool_name} | Args: {tool_args}")

    tool_result = execute_tool(tool_name, tool_args)
    print(f"[MCP Round 2] Result preview: {tool_result[:80]}...")

    # ── ROUND 3: Gemma3 reads data → natural answer ───────────
    final_prompt = f"""You are a helpful AI assistant for Hôpital Intelligent hospital.
You are talking to a {role.upper()}.

HOSPITAL DATA:
{tool_result}

USER QUESTION: "{user_message}"

Write a clear, natural response using the data above.
Rules:
- 2-4 sentences max for simple questions
- Use dash bullet points ( - ) for lists of 3 or more items
- Mark critical patients clearly as [CRITICAL]
- No markdown bold, no asterisks, no emojis
- Sound like a helpful assistant, not a database dump
- Answer in the same language the user used"""

    try:
        round3 = client.chat(
            model    = MODEL,
            messages = [{"role": "user", "content": final_prompt}],
            options  = {'temperature': 0.4, 'num_predict': 300}
        )
        final_answer = round3['message']['content']
        print(f"[MCP Round 3] Final answer generated ✅")
        return final_answer

    except Exception as e:
        return f"Error generating answer: {str(e)}"
