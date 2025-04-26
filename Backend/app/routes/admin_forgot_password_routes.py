# app/routes/admin_forgot_password_routes.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import admin_collection  # ✅ make sure you have admin_collection
from app.utils.jwt_utils import SECRET_KEY, ALGORITHM
from app.utils.password_utils import hash_password
from app.utils.sendgrid_utils import send_reset_email
from jose import jwt
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter()

class AdminForgotPasswordRequest(BaseModel):
    username: str

@router.post("/admin-forgot-password")
async def admin_forgot_password(data: AdminForgotPasswordRequest):
    admin = await admin_collection.find_one({"username": data.username})
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found.")

    reset_token_data = {
        "sub": str(admin["_id"]),
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    reset_token = jwt.encode(reset_token_data, SECRET_KEY, algorithm=ALGORITHM)

    reset_link = f"http://localhost:5173/AdminResetPassword/{reset_token}"

    await send_reset_email(admin["email"], reset_link)

    return {"message": "Reset link sent to your admin email."}


class AdminResetPasswordRequest(BaseModel):
    token: str
    password: str

@router.post("/admin-reset-password")
async def admin_reset_password(data: AdminResetPasswordRequest):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id = payload.get("sub")
        if admin_id is None:
            raise HTTPException(status_code=400, detail="Invalid token.")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token expired.")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid token.")

    hashed_password = hash_password(data.password)

    result = await admin_collection.update_one(
        {"_id": ObjectId(admin_id)},
        {"$set": {"password": hashed_password}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to reset password.")

    return {"message": "Password reset successfully for Admin."}
