from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from app.database import user_collection, admin_collection
from app.utils.password_utils import hash_password, verify_password
from app.utils.jwt_utils import create_access_token, SECRET_KEY, ALGORITHM
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
import os
from jose import jwt, JWTError

router = APIRouter()

# ⛑ OAuth2 scheme for both user and admin
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user-login")


# ✅ Create user (admin-only)
@router.post("/add-user")
async def add_user(
    fullName: str = Form(...),
    email: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    phone: str = Form(""),
    bio: str = Form(""),
    profilePic: UploadFile = File(None),
    token: str = Depends(oauth2_scheme),
):
    # 🔐 Verify admin
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    admin_id = payload.get("sub")
    admin = await admin_collection.find_one({"_id": ObjectId(admin_id)})
    if not admin:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Hash password
    hashed_password = hash_password(password)

    # Handle profile picture
    profile_pic_url = ""
    if profilePic:
        ext = profilePic.filename.split(".")[-1]
        filename = f"{username}_{datetime.now().timestamp()}.{ext}"
        upload_dir = "static/profile_pics"
        os.makedirs(upload_dir, exist_ok=True)
        path = os.path.join(upload_dir, filename)
        with open(path, "wb") as f:
            f.write(await profilePic.read())
        profile_pic_url = f"/{path}"

    # Insert user
    user_doc = {
        "fullName": fullName,
        "email": email,
        "username": username,
        "password": hashed_password,
        "role": role,
        "phone": phone,
        "bio": bio,
        "profilePic": profile_pic_url,
    }

    result = await user_collection.insert_one(user_doc)
    if result.inserted_id:
        return {"msg": "User added", "id": str(result.inserted_id)}
    raise HTTPException(status_code=500, detail="User not added")


# ✅ List all users (admin-only)
@router.get("/users")
async def get_users(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    admin = await admin_collection.find_one({"_id": ObjectId(payload.get("sub"))})
    if not admin:
        raise HTTPException(status_code=403, detail="Unauthorized")

    users = await user_collection.find().to_list(100)
    for user in users:
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password", None)
    return users


# ✅ Delete user (admin-only)
@router.delete("/delete-user/{user_id}")
async def delete_user(user_id: str, token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    admin = await admin_collection.find_one({"_id": ObjectId(payload.get("sub"))})
    if not admin:
        raise HTTPException(status_code=403, detail="Unauthorized")

    result = await user_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 1:
        return {"msg": "User deleted"}
    raise HTTPException(status_code=404, detail="User not found")


# ✅ User login (returns token)
class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/user-login")
async def user_login(payload: UserLogin):
    user = await user_collection.find_one({"username": payload.username})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": str(user["_id"])})
    return {
        "msg": "Login successful",
        "access_token": token,
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "fullName": user["fullName"],
            "email": user["email"],
            "role": user["role"],
            "profilePic": user.get("profilePic", ""),
        },
    }


# ✅ Get user by ID (user or admin)
@router.get("/user/{user_id}")
async def get_user_by_id(user_id: str, token: str = Depends(oauth2_scheme)):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        requester_id = payload.get("sub")

        # Allow user or admin
        if requester_id != user_id:
            admin = await admin_collection.find_one({"_id": ObjectId(requester_id)})
            if not admin:
                raise HTTPException(status_code=403, detail="Unauthorized")

        user = await user_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password", None)
        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ✅ Update user (user can update self OR admin can update any)
@router.put("/update-user/{user_id}")
async def update_user(
    user_id: str,
    fullName: str = Form(...),
    email: str = Form(...),
    username: str = Form(...),
    password: str = Form(""),
    role: str = Form(...),
    phone: str = Form(""),
    bio: str = Form(""),
    profilePic: UploadFile = File(None),
    token: str = Depends(oauth2_scheme),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        requester_id = payload.get("sub")

        # Check if requester is user or admin
        if requester_id != user_id:
            admin = await admin_collection.find_one({"_id": ObjectId(requester_id)})
            if not admin:
                raise HTTPException(status_code=403, detail="Unauthorized")

        update_data = {
            "fullName": fullName,
            "email": email,
            "username": username,
            "role": role,
            "phone": phone,
            "bio": bio,
        }

        if password:
            update_data["password"] = hash_password(password)

        if profilePic:
            ext = profilePic.filename.split(".")[-1]
            filename = f"{username}_{datetime.now().timestamp()}.{ext}"
            upload_dir = "static/profile_pics"
            os.makedirs(upload_dir, exist_ok=True)
            path = os.path.join(upload_dir, filename)
            with open(path, "wb") as f:
                f.write(await profilePic.read())
            update_data["profilePic"] = f"/{path}"

        result = await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

        if result.modified_count:
            return {"msg": "User updated successfully"}
        return {"msg": "No changes made"}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")
