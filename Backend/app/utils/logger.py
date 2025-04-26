from datetime import datetime
from app.database import system_logs_collection

async def log_system_event(event_type: str, description: str, event_date: str = None, extra_data: dict = None):
    log_entry = {
        "event_type": event_type,  # e.g., "upload", "shop_closed", "manual_entry"
        "description": description,  # free text
        "event_date": event_date or datetime.now().strftime("%Y-%m-%d"),  # e.g., "2025-04-17"
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # human-readable timestamp
        "extra_data": extra_data or {}  # optional additional metadata
    }
    await system_logs_collection.insert_one(log_entry)
