from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from app.database import database
from app.utils.auth import get_current_admin  # 🔐 Admin auth dependency

router = APIRouter()

# 📦 MongoDB Collection
notifications_collection = database.get_collection("notifications")

# 🎯 Notification Schema
class NotificationInput(BaseModel):
    type: str               # e.g., 'forecast', 'maintenance', 'reminder'
    title: str
    message: str
    for_user: str = "user"  # 'user', 'admin', or 'all'
    read: bool = False


# 🚀 1. Send Notification (🔐 Admin only)
@router.post("/send-notification")
async def send_notification(data: NotificationInput, current_admin: dict = Depends(get_current_admin)):
    try:
        notification_doc = {
            "type": data.type,
            "title": data.title,
            "message": data.message,
            "timestamp": datetime.utcnow(),
            "for_user": data.for_user,
            "read": data.read,
            "dismissed": False,  # 👈 initially visible to user
        }

        await notifications_collection.insert_one(notification_doc)
        return {"message": "Notification sent successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# 📬 2. Get Active Notifications for User (public or protected)
@router.get("/get-user-notifications")
async def get_user_notifications():
    try:
        notifications_cursor = notifications_collection.find(
            {
                "for_user": {"$in": ["user", "all"]},
                "dismissed": {"$ne": True}  # 👈 only non-dismissed
            },
            {
                "_id": 0,
                "type": 1,
                "title": 1,
                "message": 1,
                "timestamp": 1
            }
        ).sort("timestamp", -1).limit(20)

        notifications = await notifications_cursor.to_list(length=20)
        return notifications

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {str(e)}")


# 🧹 3. Dismiss Notifications (UI-Only Clear) (optional auth)
@router.patch("/dismiss-user-notifications")
async def dismiss_user_notifications():
    try:
        result = await notifications_collection.update_many(
            {"for_user": {"$in": ["user", "all"]}},
            {"$set": {"dismissed": True}}
        )
        return {
            "message": "Notifications dismissed from UI.",
            "modified_count": result.modified_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error dismissing notifications: {str(e)}")
