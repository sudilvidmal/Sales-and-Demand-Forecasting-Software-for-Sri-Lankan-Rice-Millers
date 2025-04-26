import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from app.main import app
from app.routes import admin_forgot_password_routes
from jose import jwt
from app.utils.jwt_utils import SECRET_KEY, ALGORITHM


@pytest.mark.asyncio
async def test_admin_forgot_password():
    with patch.object(admin_forgot_password_routes, "admin_collection") as mock_admin_collection, \
         patch.object(admin_forgot_password_routes, "send_reset_email", new_callable=AsyncMock) as mock_send_email:

        mock_admin = {
            "_id": "507f1f77bcf86cd799439011",
            "username": "adminuser",
            "email": "admin@example.com"
        }
        mock_admin_collection.find_one = AsyncMock(return_value=mock_admin)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            res = await ac.post("/admin-forgot-password", json={"username": "adminuser"})
            assert res.status_code == 200
            assert res.json()["message"] == "Reset link sent to your admin email."
            mock_send_email.assert_awaited_once()


@pytest.mark.asyncio
async def test_admin_reset_password():
    admin_id = "507f1f77bcf86cd799439011"
    token = jwt.encode({"sub": admin_id}, SECRET_KEY, algorithm=ALGORITHM)

    with patch.object(admin_forgot_password_routes, "admin_collection") as mock_admin_collection, \
         patch.object(admin_forgot_password_routes, "hash_password", return_value="hashed_pw"):

        mock_admin_collection.update_one = AsyncMock(return_value=AsyncMock(modified_count=1))

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            res = await ac.post("/admin-reset-password", json={
                "token": token,
                "password": "newsecurepassword"
            })
            assert res.status_code == 200
            assert res.json()["message"] == "Password reset successfully for Admin."
