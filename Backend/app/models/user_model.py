# app/models/user_model.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    fullName: str
    email: EmailStr
    username: str
    password: str
    role: str
    phone: Optional[str] = ""
    bio: Optional[str] = ""
