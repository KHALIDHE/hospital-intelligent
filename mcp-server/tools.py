# ============================================================
# tools.py — TRUE MCP
# ============================================================
# Tools are defined as JSON schemas so Gemma3 can READ them
# and DECIDE which ones to call.
#
# Structure:
#   TOOL_DEFINITIONS → JSON schema (what Gemma3 reads)
#   TOOL_FUNCTIONS   → actual Python functions (what runs)
#   execute_tool()   → dispatcher (runs whatever Gemma3 picks)
# ============================================================

from database import (
    get_doctor_by_user_id,
    get_doctor_patients,
    get_critical_patients,
    get_today_appointments,
    get_doctor_appointments,
    get_patient_appointments,
    get_patient_by_user_id,
    get_or_beds,
    get_doctor_availability,
    get_hospital_stats,
    get_all_staff,
    get_all_patients_admin,
)


# ============================================================
# TOOL DEFINITIONS — JSON Schema
# ============================================================
# This is what gets sent to Gemma3 so it understands
# WHAT tools exist, WHAT they do, and WHAT args they need.
# Gemma3 reads this and decides which tool to call.
# ============================================================

TOOL_DEFINITIONS = [

    # ── DOCTOR TOOLS ─────────────────────────────────────────

    {
        "type": "function",
        "function": {
            "name":        "get_my_patients",
            "description": "Get all patients assigned to the logged-in doctor. Use this when the doctor asks about their patients, patient list, or patient count.",
            "parameters": {
                "type":       "object",
                "properties": {
                    "doctor_user_id": {
                        "type":        "integer",
                        "description": "The user ID of the logged-in doctor"
                    }
                },
                "required": ["doctor_user_id"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name":        "get_critical_patients",
            "description": "Get only the critical patients for the logged-in doctor. Use when doctor asks about urgent, critical, or emergency patients.",
            "parameters": {
                "type":       "object",
                "properties": {
                    "doctor_user_id": {
                        "type":        "integer",
                        "description": "The user ID of the logged-in doctor"
                    }
                },
                "required": ["doctor_user_id"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name":        "get_today_appointments",
            "description": "Get today's appointments for the logged-in doctor. Use when doctor asks about today's schedule, meetings, or appointments.",
            "parameters": {
                "type":       "object",
                "properties": {
                    "doctor_user_id": {
                        "type":        "integer",
                        "description": "The user ID of the logged-in doctor"
                    }
                },
                "required": ["doctor_user_id"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name":        "get_all_appointments",
            "description": "Get all appointments (past and future) for the logged-in doctor.",
            "parameters": {
                "type":       "object",
                "properties": {
                    "doctor_user_id": {
                        "type":        "integer",
                        "description": "The user ID of the logged-in doctor"
                    }
                },
                "required": ["doctor_user_id"]
            }
        }
    },

    # ── NURSE TOOLS ───────────────────────────────────────────

    {
        "type": "function",
        "function": {
            "name":        "get_or_beds",
            "description": "Get all OR (operating room) beds and their status. Use when nurse asks about beds, rooms, availability, or capacity.",
            "parameters": {
                "type":       "object",
                "properties": {},
                "required":   []
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name":        "get_doctor_availability",
            "description": "Get all doctors and whether they are currently free or busy. Use when nurse asks about doctor availability or which doctor is free.",
            "parameters": {
                "type":       "object",
                "properties": {},
                "required":   []
            }
        }
    },

    # ── ADMIN TOOLS ───────────────────────────────────────────

    {
        "type": "function",
        "function": {
            "name":        "get_hospital_stats",
            "description": "Get overall hospital statistics: total patients, critical count, staff count. Use when admin asks for overview or summary.",
            "parameters": {
                "type":       "object",
                "properties": {},
                "required":   []
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name":        "get_all_patients",
            "description": "Get all patients in the hospital with their status and assigned doctor. Admin only.",
            "parameters": {
                "type":       "object",
                "properties": {},
                "required":   []
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name":        "get_staff_count",
            "description": "Get the count of all hospital staff by role (doctors, nurses, admins).",
            "parameters": {
                "type":       "object",
                "properties": {},
                "required":   []
            }
        }
    },

    # ── PATIENT TOOLS ─────────────────────────────────────────

    {
        "type": "function",
        "function": {
            "name":        "get_my_profile",
            "description": "Get the logged-in patient's own profile: name, blood type, status, assigned doctor.",
            "parameters": {
                "type":       "object",
                "properties": {
                    "user_id": {
                        "type":        "integer",
                        "description": "The user ID of the logged-in patient"
                    }
                },
                "required": ["user_id"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name":        "get_my_appointments",
            "description": "Get all appointments for the logged-in patient.",
            "parameters": {
                "type":       "object",
                "properties": {
                    "user_id": {
                        "type":        "integer",
                        "description": "The user ID of the logged-in patient"
                    }
                },
                "required": ["user_id"]
            }
        }
    },
]


# ============================================================
# TOOL FUNCTIONS — actual execution
# ============================================================
# These are the real Python functions that run when
# Gemma3 decides to call a tool.
# Each function queries PostgreSQL and returns formatted data.
# ============================================================

def _execute_get_my_patients(args: dict) -> str:
    doctor = get_doctor_by_user_id(args['doctor_user_id'])
    if not doctor:
        return "Error: Doctor profile not found."

    patients = get_doctor_patients(doctor['id'])
    if not patients:
        return "You have no patients assigned."

    lines = [f"DR. {doctor['full_name'].upper()} — PATIENT LIST ({len(patients)} patients):"]
    for i, p in enumerate(patients, 1):
        lines.append(
            f"{i}. {p['full_name']} | Code: {p['patient_code']} "
            f"| Status: {p['status'].upper()} | Blood: {p['blood_type'] or 'unknown'}"
        )
    return '\n'.join(lines)


def _execute_get_critical_patients(args: dict) -> str:
    doctor = get_doctor_by_user_id(args['doctor_user_id'])
    if not doctor:
        return "Error: Doctor profile not found."

    patients = get_critical_patients(doctor['id'])
    if not patients:
        return "✅ No critical patients. All your patients are stable or on alert."

    lines = [f"🚨 CRITICAL PATIENTS ({len(patients)} total):"]
    for p in patients:
        lines.append(f"  🔴 {p['full_name']} | Code: {p['patient_code']} | Blood: {p['blood_type'] or 'unknown'}")
    return '\n'.join(lines)


def _execute_get_today_appointments(args: dict) -> str:
    doctor = get_doctor_by_user_id(args['doctor_user_id'])
    if not doctor:
        return "Error: Doctor profile not found."

    appts = get_today_appointments(doctor['id'])
    if not appts:
        return "No appointments scheduled for today."

    lines = [f"TODAY'S SCHEDULE — Dr. {doctor['full_name']} ({len(appts)} appointments):"]
    for a in appts:
        lines.append(
            f"  ⏰ {a['scheduled_at'].strftime('%H:%M')} | {a['patient_name']} "
            f"| {a['type']} | {a['department']} | {a['status']}"
        )
    return '\n'.join(lines)


def _execute_get_all_appointments(args: dict) -> str:
    doctor = get_doctor_by_user_id(args['doctor_user_id'])
    if not doctor:
        return "Error: Doctor profile not found."

    appts = get_doctor_appointments(doctor['id'])
    if not appts:
        return "No appointments found."

    lines = [f"ALL APPOINTMENTS — Dr. {doctor['full_name']} ({len(appts)} total):"]
    for a in appts[:10]:  # limit to 10 most recent
        lines.append(
            f"  {a['scheduled_at'].strftime('%Y-%m-%d %H:%M')} | {a['patient_name']} "
            f"| {a['type']} | {a['status']}"
        )
    if len(appts) > 10:
        lines.append(f"  ... and {len(appts) - 10} more.")
    return '\n'.join(lines)


def _execute_get_or_beds(args: dict) -> str:
    beds = get_or_beds()
    if not beds:
        return "No OR beds found in the system."

    available = [b for b in beds if b['status'] == 'available']
    occupied  = [b for b in beds if b['status'] == 'occupied']

    lines = [f"OR BEDS STATUS ({len(beds)} total | ✅ {len(available)} available | 🔴 {len(occupied)} occupied):"]
    for b in beds:
        patient_info = f"— Patient: {b['patient_name']}" if b['patient_name'] else ""
        icon = "✅" if b['status'] == 'available' else "🔴"
        lines.append(
            f"  {icon} {b['room_name']} [{b['department']}] "
            f"— {b['status'].upper()} {patient_info}"
        )
    return '\n'.join(lines)


def _execute_get_doctor_availability(args: dict) -> str:
    doctors = get_doctor_availability()
    if not doctors:
        return "No doctors found."

    free = [d for d in doctors if d['status'] == 'free']
    busy = [d for d in doctors if d['status'] == 'busy']

    lines = [f"DOCTOR AVAILABILITY ({len(doctors)} total | 🟢 {len(free)} free | 🔴 {len(busy)} busy):"]
    for d in doctors:
        icon = "🟢" if d['status'] == 'free' else "🔴"
        lines.append(f"  {icon} Dr. {d['full_name']} | {d['specialty']} | {d['status'].upper()}")
    return '\n'.join(lines)


def _execute_get_hospital_stats(args: dict) -> str:
    stats = get_hospital_stats()
    staff = get_all_staff()

    lines = ["HOSPITAL OVERVIEW:"]
    lines.append(f"  Total Patients : {stats.get('total_patients', 0)}")
    lines.append(f"  Critical       : {stats.get('critical', 0)}")
    lines.append(f"  Alert          : {stats.get('alert', 0)}")
    lines.append(f"  Stable         : {stats.get('stable', 0)}")
    lines.append("STAFF:")
    for s in staff:
        lines.append(f"  {s['role'].capitalize()}: {s['count']}")
    return '\n'.join(lines)


def _execute_get_all_patients(args: dict) -> str:
    patients = get_all_patients_admin()
    if not patients:
        return "No patients in the system."

    lines = [f"ALL PATIENTS ({len(patients)} total):"]
    for p in patients:
        lines.append(
            f"  {p['full_name']} | {p['status'].upper()} "
            f"| Dr. {p['doctor_name'] or 'unassigned'}"
        )
    return '\n'.join(lines)


def _execute_get_staff_count(args: dict) -> str:
    staff = get_all_staff()
    lines = ["STAFF COUNT BY ROLE:"]
    for s in staff:
        lines.append(f"  {s['role'].capitalize()}: {s['count']}")
    return '\n'.join(lines)


def _execute_get_my_profile(args: dict) -> str:
    patient = get_patient_by_user_id(args['user_id'])
    if not patient:
        return "Patient profile not found."
    return (
        f"YOUR PROFILE:\n"
        f"  Name       : {patient['full_name']}\n"
        f"  Status     : {patient['status']}\n"
        f"  Blood Type : {patient['blood_type'] or 'unknown'}\n"
        f"  Doctor     : Dr. {patient['doctor_name'] or 'not assigned'}\n"
        f"  Code       : {patient['patient_code']}"
    )


def _execute_get_my_appointments(args: dict) -> str:
    appts = get_patient_appointments(args['user_id'])
    if not appts:
        return "No appointments found."

    lines = [f"YOUR APPOINTMENTS ({len(appts)} total):"]
    for a in appts:
        lines.append(
            f"  {a['scheduled_at'].strftime('%Y-%m-%d %H:%M')} "
            f"| Dr. {a['doctor_name']} | {a['type']} | {a['status']}"
        )
    return '\n'.join(lines)


# ============================================================
# TOOL DISPATCHER
# ============================================================
# Maps tool name → function
# Called by ai.py when Gemma3 requests a tool execution
# ============================================================

TOOL_REGISTRY = {
    "get_my_patients":        _execute_get_my_patients,
    "get_critical_patients":  _execute_get_critical_patients,
    "get_today_appointments": _execute_get_today_appointments,
    "get_all_appointments":   _execute_get_all_appointments,
    "get_or_beds":            _execute_get_or_beds,
    "get_doctor_availability":_execute_get_doctor_availability,
    "get_hospital_stats":     _execute_get_hospital_stats,
    "get_all_patients":       _execute_get_all_patients,
    "get_staff_count":        _execute_get_staff_count,
    "get_my_profile":         _execute_get_my_profile,
    "get_my_appointments":    _execute_get_my_appointments,
}


def execute_tool(tool_name: str, args: dict) -> str:
    """
    Executes a tool by name with the given arguments.
    Called by ai.py after Gemma3 decides which tool to use.
    """
    fn = TOOL_REGISTRY.get(tool_name)
    if not fn:
        return f"Error: Unknown tool '{tool_name}'"
    try:
        return fn(args)
    except Exception as e:
        return f"Error executing tool '{tool_name}': {str(e)}"


def get_tools_for_role(role: str) -> list:
    """
    Returns only the tools relevant to the user's role.
    We don't give a patient access to admin tools.
    """
    role_tools = {
        "doctor": [
            "get_my_patients",
            "get_critical_patients",
            "get_today_appointments",
            "get_all_appointments",
        ],
        "nurse": [
            "get_or_beds",
            "get_doctor_availability",
        ],
        "admin": [
            "get_hospital_stats",
            "get_all_patients",
            "get_staff_count",
            "get_or_beds",
            "get_doctor_availability",
        ],
        "patient": [
            "get_my_profile",
            "get_my_appointments",
        ],
    }

    allowed = role_tools.get(role, [])
    # Filter TOOL_DEFINITIONS to only return allowed tools
    return [t for t in TOOL_DEFINITIONS if t['function']['name'] in allowed]