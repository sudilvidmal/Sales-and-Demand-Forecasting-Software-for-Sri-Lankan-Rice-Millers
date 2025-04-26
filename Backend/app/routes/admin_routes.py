from fastapi import APIRouter, Form, UploadFile, File, HTTPException, Body, Depends
from pydantic import BaseModel
from app.database import admin_collection
from app.utils.password_utils import hash_password, verify_password
from app.utils.jwt_utils import create_access_token
from app.utils.auth import get_current_admin
import os
from datetime import datetime
from bson import ObjectId

router = APIRouter()

# Add Admin
@router.post("/add-admin")
async def add_admin(
    fullName: str = Form(...),
    email: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    phone: str = Form(""),
    bio: str = Form(""),
    profilePic: UploadFile = File(None),
):
    try:
        hashed_password = hash_password(password)
        profile_pic_url = ""

        if profilePic:
            file_ext = profilePic.filename.split('.')[-1]
            filename = f"{username}_{datetime.now().timestamp()}.{file_ext}"
            upload_dir = "static/admin_profile_pics"
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, filename)
            with open(file_path, "wb") as f:
                f.write(await profilePic.read())
            profile_pic_url = f"/{file_path}"

        admin_doc = {
            "fullName": fullName,
            "email": email,
            "username": username,
            "password": hashed_password,
            "role": role,
            "phone": phone,
            "bio": bio,
            "profilePic": profile_pic_url
        }

        result = await admin_collection.insert_one(admin_doc)
        return {"msg": "Admin added successfully", "id": str(result.inserted_id)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add admin: {str(e)}")


# Get All Admins (Protected)
@router.get("/admins")
async def get_admins(current_admin: dict = Depends(get_current_admin)):
    try:
        admins = await admin_collection.find({"role": {"$in": ["Admin", "Super Admin", "Moderator"]}}).to_list(100)
        for admin in admins:
            admin["id"] = str(admin["_id"])
            admin.pop("_id", None)
            admin.pop("password", None)
        return admins
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching admins: {str(e)}")


# Update Admin (Protected)
@router.put("/update-admin/{admin_id}")
async def update_admin(
    admin_id: str,
    fullName: str = Form(...),
    email: str = Form(...),
    username: str = Form(...),
    password: str = Form(""),
    confirmPassword: str = Form(""),
    role: str = Form(...),
    phone: str = Form(""),
    bio: str = Form(""),
    profilePic: UploadFile = File(None),
    current_admin: dict = Depends(get_current_admin),
):
    try:
        existing_admin = await admin_collection.find_one({"_id": ObjectId(admin_id)})
        if not existing_admin:
            raise HTTPException(status_code=404, detail="Admin not found")

        update_data = {
            "fullName": fullName,
            "email": email,
            "username": username,
            "role": role,
            "phone": phone,
            "bio": bio,
        }

        if password and password == confirmPassword:
            update_data["password"] = hash_password(password)

        if profilePic:
            file_ext = profilePic.filename.split(".")[-1]
            filename = f"{username}_{datetime.now().timestamp()}.{file_ext}"
            upload_dir = "static/admin_profile_pics"
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, filename)
            with open(file_path, "wb") as f:
                f.write(await profilePic.read())
            profile_pic_url = f"/{file_path}"
            update_data["profilePic"] = profile_pic_url

        await admin_collection.update_one(
            {"_id": ObjectId(admin_id)}, {"$set": update_data}
        )

        return {"msg": "Admin updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")


# Delete Admin (Optional: Can add protection if needed)
@router.delete("/delete-admin/{admin_id}")
async def delete_admin(
    admin_id: str,
    current_admin: dict = Depends(get_current_admin)  # 🔒 Protect with token
):
    try:
        result = await admin_collection.delete_one({"_id": ObjectId(admin_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Admin not found")
        return {"msg": "Admin deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


# Admin Login (Returns token)
class AdminLogin(BaseModel):
    username: str
    password: str

@router.post("/admin-login")
async def admin_login(payload: AdminLogin):
    try:
        admin = await admin_collection.find_one({"username": payload.username})
        if not admin or not verify_password(payload.password, admin["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token(data={"sub": str(admin["_id"])})

        return {
            "msg": "Login successful",
            "access_token": token,
            "admin": {
                "id": str(admin["_id"]),
                "username": admin["username"],
                "fullName": admin["fullName"],
                "email": admin["email"],
                "role": admin["role"],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")



# Get Admin by ID (Protected)
@router.get("/admin/{admin_id}")
async def get_admin_by_id(admin_id: str, current_admin: dict = Depends(get_current_admin)):
    try:
        admin = await admin_collection.find_one({"_id": ObjectId(admin_id)})
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")

        admin["id"] = str(admin["_id"])
        admin.pop("_id", None)
        admin.pop("password", None)
        return admin
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch admin: {str(e)}")
