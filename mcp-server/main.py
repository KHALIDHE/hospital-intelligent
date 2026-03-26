# ============================================================
# main.py — TRUE MCP Server
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai import ask_gemma

app = FastAPI(
    title       = "Hospital MCP Server — True MCP",
    description = "Gemma3 decides which tools to call. Python executes.",
    version     = "2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:8000", "http://localhost:5173"],
    allow_methods = ["*"],
    allow_headers = ["*"],
)


class ChatRequest(BaseModel):
    message: str
    role:    str   # 'doctor' | 'nurse' | 'admin' | 'patient'
    user_id: int   # injected by Django from JWT token


@app.get("/")
def health_check():
    return {
        "status":       "running",
        "architecture": "True MCP — LLM controls tool selection",
        "model":        "gemma3:4b",
        "tools":        11
    }


@app.post("/chat")
def chat(request: ChatRequest):
    """
    True MCP endpoint.
    Gemma3 reads the tool definitions and decides what to call.
    Python executes. Gemma3 answers.
    """

    # Validate role
    if request.role not in ['doctor', 'nurse', 'admin', 'patient']:
        raise HTTPException(status_code=400, detail="Invalid role")

    # TRUE MCP — LLM decides tools
    reply = ask_gemma(
        user_message = request.message,
        role         = request.role,
        user_id      = request.user_id,
    )

    return {"reply": reply}