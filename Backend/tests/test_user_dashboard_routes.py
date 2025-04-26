import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app
from app.routes import user_section_dashboard_routes
from app.utils.auth import get_current_user


@pytest.fixture(autouse=True)
def override_get_current_user():
    async def fake_user():
        return {"id": "mock_user_id", "username": "mockuser", "role": "Staff"}
    app.dependency_overrides[get_current_user] = fake_user


# ✅ Helper to wrap return values in AsyncMock correctly
def mock_aggregate_result(result_list):
    agg = AsyncMock()
    agg.to_list = AsyncMock(return_value=result_list)
    return agg


@pytest.mark.asyncio
async def test_kpi_route():
    with patch.object(user_section_dashboard_routes, "test_upload_data_collection") as mock_sales, \
         patch.object(user_section_dashboard_routes, "forecast_collection") as mock_forecast, \
         patch.object(user_section_dashboard_routes, "forecast_accuracy_collection") as mock_accuracy, \
         patch.object(user_section_dashboard_routes, "inventory_analysis_collection") as mock_inventory:

        mock_sales.aggregate.side_effect = [
            mock_aggregate_result([{"total_sales": 100}]),
            mock_aggregate_result([{"total_sales": 80}])
        ]
        mock_forecast.aggregate.return_value = mock_aggregate_result([{"total_forecast_qty": 300}])
        mock_accuracy.find_one = AsyncMock(return_value={"total_forecast_qty": 250})

        mock_inventory.aggregate.side_effect = [
            mock_aggregate_result([{"total_remaining_stock": 900}]),
            mock_aggregate_result([{"total_remaining_stock": 850}]),
            mock_aggregate_result([{"yesterday_alerts": 3}])
        ]
        mock_inventory.count_documents = AsyncMock(return_value=5)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            res = await ac.get("/user/dashboard/kpi")
            assert res.status_code == 200
            data = res.json()
            assert data["forecastNext30Days"] == 300
            assert data["understockCount"] == 5


@pytest.mark.asyncio
async def test_charts_route():
    with patch.object(user_section_dashboard_routes, "test_upload_data_collection") as mock_sales, \
         patch.object(user_section_dashboard_routes, "forecast_collection") as mock_forecast, \
         patch.object(user_section_dashboard_routes, "inventory_collection") as mock_inventory, \
         patch.object(user_section_dashboard_routes, "database") as mock_db:

        mock_sales.aggregate.return_value = mock_aggregate_result([
            {"_id": "2025-04-18", "total_sales": 100},
            {"_id": "2025-04-19", "total_sales": 120}
        ])
        mock_forecast.aggregate.return_value = mock_aggregate_result([
            {"_id": "SIERRA RED RAW RICE -5KG", "total_forecast": 250},
            {"_id": "SAUMYA WHITE RICE -5KG", "total_forecast": 200}
        ])
        mock_inventory.aggregate.return_value = mock_aggregate_result([
            {"_id": "2025-04-21", "incoming": 200},
            {"_id": "2025-04-22", "incoming": 180}
        ])

        # ✅ FIX: Return mock collection from get_collection() that has aggregate().to_list()
        mock_collection = MagicMock()
        mock_collection.aggregate.return_value = mock_aggregate_result([
            {"_id": "2025-04-21", "outgoing": 150},
            {"_id": "2025-04-22", "outgoing": 130}
        ])
        mock_db.get_collection.return_value = mock_collection

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            res = await ac.get("/user/dashboard/charts")
            assert res.status_code == 200
            data = res.json()
            assert "rice_sales_last_7_days" in data
            assert "forecasted_demand" in data
            assert "stock_movement" in data


@pytest.mark.asyncio
async def test_current_stock_levels():
    with patch.object(user_section_dashboard_routes, "database") as mock_db:
        # ✅ FIX: Use MagicMock for collection with find().to_list()
        mock_inventory_collection = MagicMock()
        mock_inventory_collection.find.return_value.to_list = AsyncMock(return_value=[
            {"riceType": "Red Rice", "current_stock_kg": 850},
            {"riceType": "White Rice", "current_stock_kg": 760}
        ])
        mock_db.get_collection.return_value = mock_inventory_collection

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            res = await ac.get("/user/dashboard/current-stock-levels")
            assert res.status_code == 200
            data = res.json()
            assert "stock_levels" in data
            assert len(data["stock_levels"]) == 2


@pytest.mark.asyncio
async def test_system_logs():
    with patch.object(user_section_dashboard_routes, "system_logs_collection") as mock_logs:
        mock_logs.find.return_value.sort.return_value.limit.return_value.to_list = AsyncMock(return_value=[
            {"event_type": "sales_upload", "description": "Sales data uploaded", "timestamp": "2025-04-24T12:00:00"}
        ])

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            res = await ac.get("/user/dashboard/system-logs")
            assert res.status_code == 200
            data = res.json()
            assert data["logs"][0]["icon"] == "upload"
