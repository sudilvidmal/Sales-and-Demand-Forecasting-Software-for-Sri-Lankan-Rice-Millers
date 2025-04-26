import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from app.main import app
from app.routes import admin_dashboard_routes
from app.utils.auth import get_current_admin

# ✅ Override admin authentication for all tests
@pytest.fixture(autouse=True)
def override_get_current_admin():
    async def mock_admin():
        return {"id": "admin123", "username": "adminuser", "role": "Admin"}
    app.dependency_overrides[get_current_admin] = mock_admin

# ✅ Helper: Run GET request using ASGI transport
async def get_response(endpoint: str):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        return await ac.get(endpoint)

# ✅ Test: /admin-dashboard/model-summary
@pytest.mark.asyncio
async def test_model_summary():
    with patch.object(admin_dashboard_routes, "forecast_accuracy_collection") as mock_collection:
        mock_collection.find_one = AsyncMock(return_value={
            "training_date": "2025-04-01",
            "model_name": "XGBoost",
            "per_rice_type_metrics": [
                {"mae": 12.5, "r2_score": 0.88},
                {"mae": 9.0, "r2_score": 0.91}
            ]
        })

        res = await get_response("/admin-dashboard/model-summary")
        assert res.status_code == 200
        data = res.json()
        assert data["mape"] == 10.75
        assert data["r2_percentage"] == 89.5

# ✅ Test: /admin-dashboard/admin-stats
@pytest.mark.asyncio
async def test_admin_dashboard_stats():
    with patch.object(admin_dashboard_routes, "users_collection") as mock_users, \
         patch.object(admin_dashboard_routes, "admins_collection") as mock_admins, \
         patch.object(admin_dashboard_routes, "upload_data_collection") as mock_uploads, \
         patch.object(admin_dashboard_routes, "forecast_accuracy_collection") as mock_forecast:

        mock_users.count_documents = AsyncMock(return_value=10)
        mock_admins.count_documents = AsyncMock(return_value=3)
        mock_uploads.distinct = AsyncMock(return_value=["Red Rice", "White Rice"])
        mock_forecast.count_documents = AsyncMock(return_value=1)

        res = await get_response("/admin-dashboard/admin-stats")
        assert res.status_code == 200
        data = res.json()
        assert data["totalUsers"] == 10
        assert data["adminCount"] == 3
        assert data["riceTypes"] == 2
        assert data["activeModels"] == 1
        assert data["activeAccounts"] == 13
