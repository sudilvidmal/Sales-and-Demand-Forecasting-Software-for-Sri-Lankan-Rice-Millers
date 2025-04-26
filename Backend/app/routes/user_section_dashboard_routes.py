from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from app.database import (
    test_upload_data_collection,
    forecast_collection,
    inventory_collection,
    database,
    system_logs_collection,  # <-- 🔥 ADD THIS
)
from collections import defaultdict
from app.utils.auth import get_current_user


router = APIRouter()

# ✅ Missing Collections initialized here
forecast_accuracy_collection = database.get_collection("forecast_accuracy")
inventory_analysis_collection = database.get_collection("inventory_analysis")

@router.get("/kpi")
async def get_user_dashboard_kpis(current_user: dict = Depends(get_current_user)):
    try:
        today = datetime.today()
        today_str = today.strftime("%Y-%m-%d")
        yesterday = today - timedelta(days=1)
        yesterday_str = yesterday.strftime("%Y-%m-%d")

        # ✅ Today's Sales
        today_sales_cursor = test_upload_data_collection.aggregate([
            {"$match": {"date": today_str}},
            {"$group": {"_id": None, "total_sales": {"$sum": "$quantity_kg"}}}
        ])
        today_sales = await today_sales_cursor.to_list(length=1)
        total_sales_today = today_sales[0]["total_sales"] if today_sales else 0

        # ✅ Yesterday's Sales
        yday_sales_cursor = test_upload_data_collection.aggregate([
            {"$match": {"date": yesterday_str}},
            {"$group": {"_id": None, "total_sales": {"$sum": "$quantity_kg"}}}
        ])
        yday_sales = await yday_sales_cursor.to_list(length=1)
        total_sales_yesterday = yday_sales[0]["total_sales"] if yday_sales else 0

        # ✅ Today's Sales Trend
        if total_sales_yesterday > 0:
            sales_trend = ((total_sales_today - total_sales_yesterday) / total_sales_yesterday) * 100
        elif total_sales_today > 0:
            sales_trend = 100
        else:
            sales_trend = 0

        # ✅ 30-Day Forecast
        forecast_cursor = forecast_collection.aggregate([
            {"$group": {"_id": None, "total_forecast_qty": {"$sum": "$Predicted Quantity (KG)"}}}
        ])
        forecast_result = await forecast_cursor.to_list(length=1)
        total_forecast = forecast_result[0]["total_forecast_qty"] if forecast_result else 0

        # ✅ Previous Forecast (last model recorded)
        prev_model_doc = await forecast_accuracy_collection.find_one(sort=[("training_date", -1)])
        previous_forecast = prev_model_doc.get("total_forecast_qty", 0) if prev_model_doc else 0

        # ✅ Forecast Trend
        if previous_forecast > 0:
            forecast_trend = ((total_forecast - previous_forecast) / previous_forecast) * 100
        elif total_forecast > 0:
            forecast_trend = 100
        else:
            forecast_trend = 0

        # ✅ Stock Remaining (today)
        stock_cursor = inventory_analysis_collection.aggregate([
            {"$group": {"_id": None, "total_remaining_stock": {"$sum": "$post_forecast_stock_kg"}}}
        ])
        stock_result = await stock_cursor.to_list(length=1)
        total_stock_remaining = stock_result[0]["total_remaining_stock"] if stock_result else 0

        # ✅ Yesterday's Stock
        yesterday_stock_cursor = inventory_analysis_collection.aggregate([
            {"$match": {"analysis_date": yesterday_str}},
            {"$group": {"_id": None, "total_remaining_stock": {"$sum": "$post_forecast_stock_kg"}}}
        ])
        yesterday_stock_result = await yesterday_stock_cursor.to_list(length=1)
        previous_stock = yesterday_stock_result[0]["total_remaining_stock"] if yesterday_stock_result else 0

        # ✅ Stock Trend
        if previous_stock > 0:
            stock_trend = ((total_stock_remaining - previous_stock) / previous_stock) * 100
        elif total_stock_remaining > 0:
            stock_trend = 100
        else:
            stock_trend = 0

        # ✅ Understock Alerts (today)
        alert_count_today = await inventory_analysis_collection.count_documents({"status": "🛑 Critical"})

        # ✅ Understock Alerts (yesterday, optional fallback handling)
        alert_count_yesterday_cursor = inventory_analysis_collection.aggregate([
            {"$match": {"analysis_date": yesterday_str, "status": "🛑 Critical"}},
            {"$count": "yesterday_alerts"}
        ])
        alert_yesterday = await alert_count_yesterday_cursor.to_list(length=1)
        alert_count_yesterday = alert_yesterday[0]["yesterday_alerts"] if alert_yesterday else 0

        # ✅ Understock Alert Trend
        if alert_count_yesterday > 0:
            understock_trend = ((alert_count_today - alert_count_yesterday) / alert_count_yesterday) * 100
        elif alert_count_today > 0:
            understock_trend = 100
        else:
            understock_trend = 0

        # 🔥 Finally return all
        return {
            "todaysSales": round(total_sales_today, 2),
            "forecastNext30Days": round(total_forecast, 2),
            "totalStockRemaining": round(total_stock_remaining, 2),
            "understockCount": alert_count_today,
            "todaysSalesTrend": round(sales_trend, 2),
            "forecastTrend": round(forecast_trend, 2),
            "stockTrend": round(stock_trend, 2),
            "understockTrend": round(understock_trend, 2),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load user dashboard KPIs: {str(e)}")

@router.get("/charts")
async def get_dashboard_charts(current_user: dict = Depends(get_current_user)):
    try:
        today = datetime.today()
        last_7_days = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)]

        rice_sales_cursor = test_upload_data_collection.aggregate([
            {"$match": {"date": {"$in": last_7_days}}},
            {"$group": {"_id": "$date", "total_sales": {"$sum": "$quantity_kg"}}},
            {"$sort": {"_id": 1}}
        ])
        rice_sales_raw = await rice_sales_cursor.to_list(length=7)
        rice_sales_data = [{"name": item["_id"][5:], "value": item["total_sales"]} for item in rice_sales_raw]

        forecast_cursor = forecast_collection.aggregate([
            {"$group": {"_id": "$Rice Type", "total_forecast": {"$sum": "$Predicted Quantity (KG)"}}},
            {"$sort": {"total_forecast": -1}},
            {"$limit": 7}
        ])
        forecast_data = await forecast_cursor.to_list(length=7)
        forecast_chart_data = [
            {"name": item["_id"].replace("SIERRA ", "").replace("SAUMYA ", ""), "value": item["total_forecast"]}
            for item in forecast_data
        ]

        inv_cursor = inventory_collection.aggregate([
            {"$group": {"_id": "$dateReceived", "incoming": {"$sum": "$quantity"}}},
            {"$sort": {"_id": 1}}
        ])
        inv_data = await inv_cursor.to_list(length=100)

        analysis_collection = database.get_collection("inventory_analysis")
        analysis_cursor = analysis_collection.aggregate([
            {"$group": {"_id": "$last_updated", "outgoing": {"$sum": "$forecast_30_days_qty"}}}
        ])
        analysis_data = await analysis_cursor.to_list(length=100)

        movement_map = defaultdict(lambda: {"incoming": 0, "outgoing": 0})
        for entry in inv_data:
            date = entry["_id"][:10]
            movement_map[date]["incoming"] += entry["incoming"]
        for entry in analysis_data:
            date = entry["_id"][:10]
            movement_map[date]["outgoing"] += entry["outgoing"]

        stock_movement_data = [
            {"name": date[5:], "value": abs(data["incoming"] - data["outgoing"])}
            for date, data in sorted(movement_map.items())
        ]

        return {
            "rice_sales_last_7_days": rice_sales_data,
            "forecasted_demand": forecast_chart_data,
            "stock_movement": stock_movement_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load chart data.")


@router.get("/current-stock-levels")
async def get_current_stock_levels(current_user: dict = Depends(get_current_user)):
    try:
        inventory_analysis_collection = database.get_collection("inventory_analysis")
        records = await inventory_analysis_collection.find({}).to_list(length=100)

        formatted = [
            {
                "type": item.get("riceType"),
                "current": round(item.get("current_stock_kg", 0), 2),
                "capacity": 1000
            }
            for item in records
        ]
        return {"stock_levels": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load current stock levels.")


@router.get("/system-logs")
async def get_system_logs(current_user: dict = Depends(get_current_user)):
    try:
        logs_cursor = system_logs_collection.find().sort("timestamp", -1).limit(5)
        logs = await logs_cursor.to_list(length=5)

        formatted_logs = []
        for log in logs:
            formatted_logs.append({
                "icon": get_icon_by_event_type(log.get("event_type")),
                "description": log.get("description"),
                "timestamp": log.get("timestamp"),
            })

        return {"logs": formatted_logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch system logs.")

def get_icon_by_event_type(event_type: str):
    if event_type == "sales_upload":
        return "upload"
    elif event_type in ["forecast_generated", "forecast_saved", "forecast_records"]:
        return "chart"
    elif event_type == "stock_sync":
        return "database"
    else:
        return "warning"