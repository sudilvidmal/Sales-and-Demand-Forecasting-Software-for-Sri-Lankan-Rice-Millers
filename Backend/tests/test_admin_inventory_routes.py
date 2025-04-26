import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from app.main import app
from app.routes import admin_inventory_routes
from app.utils.auth import get_current_admin

# 🔒 Mock admin authentication
@pytest.fixture(autouse=True)
def override_get_current_admin():
    async def mock_admin():
        return {"id": "admin123", "role": "Admin", "username": "admin"}
    app.dependency_overrides[get_current_admin] = mock_admin


# ✅ Add Inventory Record
@pytest.mark.asyncio
async def test_add_inventory_record():
    with patch.object(admin_inventory_routes, "inventory_collection") as mock_inventory:
        mock_inventory.insert_one = AsyncMock(return_value=AsyncMock(inserted_id="mock_id"))
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            res = await ac.post("/admin/inventory/add", json={
                "riceType": "Red Rice",
                "quantity": 100,
                "warehouse": "A1",
                "batchNo": "B001",
                "dateReceived": "2025-04-24"
            })
            assert res.status_code == 200
            assert res.json()["message"] == "Inventory added"


# ✅ Get All Inventory Records
@pytest.mark.asyncio
async def test_get_all_inventory_records():
    with patch.object(admin_inventory_routes, "inventory_collection") as mock_inventory:
        mock_inventory.find.return_value.sort.return_value.to_list = AsyncMock(return_value=[
            {
                "_id": "mockid1",
                "riceType": "Red Rice",
                "quantity": 100,
                "warehouse": "A1",
                "batchNo": "B001",
                "dateReceived": "2025-04-24"
            }
        ])
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            res = await ac.get("/admin/inventory/all")
            assert res.status_code == 200
            assert "data" in res.json()
            assert res.json()["data"][0]["riceType"] == "Red Rice"

# ✅ Delete Inventory Record
@pytest.mark.asyncio
async def test_delete_inventory_record():
    with patch.object(admin_inventory_routes, "inventory_collection") as mock_inventory:
        mock_inventory.delete_one = AsyncMock(return_value=AsyncMock(deleted_count=1))
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            res = await ac.delete("/admin/inventory/delete/507f1f77bcf86cd799439011")
            assert res.status_code == 200
            assert res.json()["message"] == "Inventory deleted"
