from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from bson import ObjectId
from app.database import admin_collection, user_collection
from app.utils.jwt_utils import SECRET_KEY, ALGORITHM
from bson.errors import InvalidId

# ✅ Separate token schemes
admin_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin-login")
user_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user-login")

# ✅ Admin JWT Validator
async def get_current_admin(token: str = Depends(admin_oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id: str = payload.get("sub")
        if admin_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    admin = await admin_collection.find_one({"_id": ObjectId(admin_id)})
    if not admin:
        raise credentials_exception

    return admin

# ✅ User JWT Validator
from bson.errors import InvalidId

async def get_current_user(token: str = Depends(user_oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate user credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id or not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Error: 400: Invalid user ID")
        user = await user_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise credentials_exception
        return user

    except JWTError:
        raise credentials_exception
