import pytest
from httpx import AsyncClient
from app.main import app
from app.database import user_collection
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TEST_USER = {
    "username": "testuser",
    "password": "123456",
    "email": "test@gmail.com",
    "fullName": "Test User",
    "role": "Staff"
}

@pytest.mark.asyncio
async def test_user_login_success():
    # Ensure test user exists
    existing = await user_collection.find_one({"username": TEST_USER["username"]})
    if not existing:
        await user_collection.insert_one({
            **TEST_USER,
            "password": pwd_context.hash(TEST_USER["password"])
        })

    async with AsyncClient(app=app, base_url="http://test") as ac:
        res = await ac.post("/user-login", json={
            "username": TEST_USER["username"],
            "password": TEST_USER["password"]
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
