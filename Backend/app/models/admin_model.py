from pydantic import BaseModel, EmailStr

class Admin(BaseModel):
    fullName: str
    email: EmailStr
    username: str
    password: str
    role: str
    phone: str = ""
    bio: str = ""
