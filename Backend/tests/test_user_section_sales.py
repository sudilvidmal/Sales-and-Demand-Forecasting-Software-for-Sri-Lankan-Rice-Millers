import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from tests.utils.token_helper import get_valid_user_token

@pytest.mark.asyncio
async def test_get_sales_kpi():
    token = await get_valid_user_token()
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {token}"}
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.get("/user/sales/kpi", headers=headers)
        assert res.status_code == 200
        assert "totalToday" in res.json()

@pytest.mark.asyncio
async def test_get_sales_charts():
    token = await get_valid_user_token()
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {token}"}
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.get("/user/sales/charts", headers=headers)
        assert res.status_code == 200
        assert "bar" in res.json()

@pytest.mark.asyncio
async def test_get_sales_table():
    token = await get_valid_user_token()
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {token}"}
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.get("/user/sales/table", headers=headers)
        assert res.status_code == 200
        assert "data" in res.json()

@pytest.mark.asyncio
async def test_get_sales_alerts():
    token = await get_valid_user_token()
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {token}"}
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.get("/user/sales/alerts", headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)
