import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from app.main import app
from app.routes import user_section_dashboard_routes  # Or wherever your route is registered
from app.utils.auth import get_current_user


@pytest.fixture(autouse=True)
def override_get_current_user():
    async def fake_user():
        return {"id": "user123", "username": "mockuser", "role": "Staff"}
    app.dependency_overrides[get_current_user] = fake_user


def mock_async_find(data):
    async def _cursor():
        for item in data:
            yield item
    return _cursor()


@pytest.mark.asyncio
async def test_inventory_analysis():
    forecast_docs = [
        {"Date": "2025-04-25", "Rice Type": "Red Rice", "Predicted Quantity (KG)": 100},
        {"Date": "2025-04-25", "Rice Type": "White Rice", "Predicted Quantity (KG)": 80},
    ]

    inventory_docs = [
        {"riceType": "Red Rice", "quantity": 150},
        {"riceType": "White Rice", "quantity": 60},
    ]

    sales_docs = [
        {"rice_type": "Red Rice", "quantity_kg": 30},
        {"rice_type": "White Rice", "quantity_kg": 50},
    ]

    with patch("app.routes.user_section_dashboard_routes.forecast_collection.find", return_value=mock_async_find(forecast_docs)), \
         patch("app.routes.user_section_dashboard_routes.inventory_collection.find", return_value=AsyncMock(return_value=inventory_docs)), \
         patch("app.routes.user_section_dashboard_routes.test_upload_data_collection.find", return_value=AsyncMock(return_value=sales_docs)), \
         patch("app.routes.user_section_dashboard_routes.inventory_analysis_collection.update_one", new_callable=AsyncMock):

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            res = await ac.get("/inventory/analysis")
            assert res.status_code == 200
            data = res.json()
            assert "data" in data
            assert len(data["data"]) > 0
