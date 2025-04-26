from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional
from datetime import datetime
from app.database import database, inventory_collection
from app.utils.auth import get_current_user  # 🔐 JWT Dependency

router = APIRouter()
upload_collection = database.get_collection("test_upload_data")
forecast_collection = database.get_collection("forecast_accuracy")
forecast_result_collection = database.get_collection("rice_forecasts")
forecast_chart_collection = database.get_collection("forecast_chart_data")
inventory_analysis_collection = database.get_collection("inventory_analysis")

# ✅ Report Summary (JWT-protected)
@router.get("/report-summary")
async def get_report_summary(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    rice_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        match_query = {"closed": False}

        if rice_type:
            match_query["rice_type"] = rice_type

        if from_date or to_date:
            match_query["date"] = {}
            if from_date:
                match_query["date"]["$gte"] = from_date
            if to_date:
                match_query["date"]["$lte"] = to_date

        pipeline = [
            {"$match": match_query},
            {
                "$group": {
                    "_id": "$rice_type",
                    "total_quantity": {"$sum": "$quantity_kg"},
                    "total_revenue": {"$sum": "$gross_amount"},
                }
            },
            {
                "$project": {
                    "rice_type": "$_id",
                    "total_quantity": 1,
                    "total_revenue": 1,
                }
            },
        ]

        results = await upload_collection.aggregate(pipeline).to_list(length=None)

        if not results:
            return {
                "total_sales_kg": 0,
                "total_revenue": 0,
                "most_sold": "N/A",
                "least_sold": "N/A",
                "avg_per_day": 0,
                "date_range": {"from": "N/A", "to": "N/A"},
            }

        total_sales_kg = sum(r["total_quantity"] for r in results)
        total_revenue = sum(r["total_revenue"] for r in results)
        rice_type_sales = sorted(results, key=lambda r: r["total_quantity"], reverse=True)

        raw_dates = await upload_collection.distinct("date", match_query)
        parsed_dates = [datetime.strptime(d, "%Y-%m-%d") for d in raw_dates if isinstance(d, str)]
        date_range = {
            "from": min(parsed_dates).strftime("%Y-%m-%d") if parsed_dates else "N/A",
            "to": max(parsed_dates).strftime("%Y-%m-%d") if parsed_dates else "N/A",
        }

        unique_days = len(set(raw_dates))
        avg_per_day = round(total_sales_kg / unique_days, 2) if unique_days else 0

        return {
            "total_sales_kg": total_sales_kg,
            "total_revenue": total_revenue,
            "most_sold": rice_type_sales[0]["rice_type"],
            "least_sold": rice_type_sales[-1]["rice_type"],
            "avg_per_day": avg_per_day,
            "date_range": date_range,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get summary: {str(e)}")


# ✅ Model Info (JWT-protected)
@router.get("/model-info")
async def get_latest_model_info(current_user: dict = Depends(get_current_user)):
    try:
        latest_model = await forecast_collection.find_one(sort=[("training_date", -1)])
        if not latest_model:
            raise HTTPException(status_code=404, detail="No model data found")

        return {
            "model_name": latest_model["model_name"],
            "training_date": latest_model["training_date"],
            "forecast_horizon_days": latest_model["forecast_horizon_days"],
            "total_rice_types_modeled": latest_model["total_rice_types_modeled"],
            "total_records_used": latest_model["total_records_used"],
            "per_rice_type_metrics": latest_model.get("per_rice_type_metrics", []),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching model info: {str(e)}")


# ✅ Forecast Data (JWT-protected)
@router.get("/forecast-data")
async def get_forecast_data(
    rice_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        query = {}
        if rice_type:
            query["Rice Type"] = rice_type

        forecast_docs = await forecast_result_collection.find(query).sort("Date", 1).to_list(length=None)

        result = [
            {
                "date": doc.get("Date"),
                "rice_type": doc.get("Rice Type"),
                "forecast": round(doc.get("Predicted Quantity (KG)", 0), 2)
            }
            for doc in forecast_docs
        ]

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch forecast data: {str(e)}")


# ✅ Inventory Impact (JWT-protected)
@router.get("/inventory-impact")
async def get_inventory_impact(current_user: dict = Depends(get_current_user)):
    try:
        docs = await inventory_analysis_collection.find({}).to_list(length=None)

        result = [
            {
                "riceType": doc.get("riceType"),
                "current_stock_kg": round(doc.get("current_stock_kg", 0), 2),
                "forecast_30_days_qty": round(doc.get("forecast_30_days_qty", 0), 2),
                "post_forecast_stock_kg": round(doc.get("post_forecast_stock_kg", 0), 2),
                "status": doc.get("status", "⚠️ Unknown"),
            }
            for doc in docs
        ]

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch inventory impact data: {str(e)}")


# ✅ Rice Type Breakdown (JWT-protected)
@router.get("/rice-breakdown")
async def get_rice_type_breakdown(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        match_query = {"closed": False}
        if from_date or to_date:
            match_query["date"] = {}
            if from_date:
                match_query["date"]["$gte"] = from_date
            if to_date:
                match_query["date"]["$lte"] = to_date

        pipeline = [
            {"$match": match_query},
            {
                "$group": {
                    "_id": "$rice_type",
                    "total_quantity": {"$sum": "$quantity_kg"},
                    "total_revenue": {"$sum": "$gross_amount"},
                    "avg_price_per_kg": {"$avg": "$price_per_kg"},
                }
            },
            {
                "$project": {
                    "rice_type": "$_id",
                    "total_quantity": 1,
                    "total_revenue": 1,
                    "avg_price_per_kg": 1,
                    "_id": 0
                }
            },
            {"$sort": {"total_quantity": -1}}
        ]

        all_dates = await upload_collection.distinct("date", match_query)
        all_dates = sorted([d for d in all_dates if isinstance(d, str)])

        from_db = all_dates[0] if all_dates else "N/A"
        to_db = all_dates[-1] if all_dates else "N/A"

        result = await upload_collection.aggregate(pipeline).to_list(length=None)

        return {
            "data": result,
            "earliest_date": from_db,
            "latest_date": to_db
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Inventory Distribution (JWT-protected)
@router.get("/inventory-distribution")
async def get_inventory_distribution(current_user: dict = Depends(get_current_user)):
    try:
        records = await inventory_collection.find({}).to_list(length=None)

        formatted = [
            {
                "riceType": doc.get("riceType", "N/A"),
                "batchNo": doc.get("batchNo", "N/A"),
                "warehouse": doc.get("warehouse", "N/A"),
                "quantity": doc.get("quantity", 0),
                "dateReceived": doc.get("dateReceived", "N/A"),
            }
            for doc in records
        ]
        return formatted

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching inventory distribution: {str(e)}")
