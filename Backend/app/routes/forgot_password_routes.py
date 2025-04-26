from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import user_collection
from app.utils.jwt_utils import SECRET_KEY, ALGORITHM
from app.utils.password_utils import hash_password
from app.utils.sendgrid_utils import send_reset_email  # ✅ Corrected import
from jose import jwt
from datetime import datetime, timedelta
from bson import ObjectId  # ✅ Add this missing import

router = APIRouter()

# 📩 Model for forgot password
class ForgotPasswordRequest(BaseModel):
    username: str

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await user_collection.find_one({"username": data.username})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    reset_token_data = { 
        "sub": str(user["_id"]),
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    reset_token = jwt.encode(reset_token_data, SECRET_KEY, algorithm=ALGORITHM)

    reset_link = f"http://localhost:5173/ResetPassword/{reset_token}"

    # ✅ Send reset link via email
    await send_reset_email(user["email"], reset_link)

    return {"message": "Reset link sent to your email."}

# 🔒 Model for reset password
class ResetPasswordRequest(BaseModel):
    token: str
    password: str

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=400, detail="Invalid token.")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token expired.")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid token.")

    # ✅ Hash the new password securely
    hashed_password = hash_password(data.password)

    # ✅ Update password in the database
    result = await user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed_password}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to reset password.")

    return {"message": "Password reset successfully."}
