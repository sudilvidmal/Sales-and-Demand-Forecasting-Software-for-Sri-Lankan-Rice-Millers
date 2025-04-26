from fastapi import APIRouter, HTTPException, Depends, Query
from app.database import database
from app.utils.auth import get_current_admin  # 🔐 Admin authentication

router = APIRouter()

accuracy_collection = database.get_collection("forecast_accuracy")
chart_collection = database.get_collection("forecast_chart_data")


# 📌 1. Training Details
@router.get("/training-details")
async def get_training_details(current_admin: dict = Depends(get_current_admin)):
    try:
        latest_doc = await accuracy_collection.find_one(
            sort=[("training_date", -1)],
            projection={
                "_id": 0,
                "model_name": 1,
                "training_date": 1,
                "forecast_horizon_days": 1,
                "total_rice_types_modeled": 1,
                "total_records_used": 1,
                "date_range": 1
            }
        )
        if not latest_doc:
            raise HTTPException(status_code=404, detail="Training details not found")
        return latest_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving training details: {str(e)}")


# 📌 2. Accuracy Metrics
@router.get("/accuracy-metrics")
async def get_accuracy_metrics(current_admin: dict = Depends(get_current_admin)):
    try:
        latest_doc = await accuracy_collection.find_one(
            sort=[("training_date", -1)],
            projection={"_id": 0, "per_rice_type_metrics": 1}
        )
        if not latest_doc or "per_rice_type_metrics" not in latest_doc:
            raise HTTPException(status_code=404, detail="Accuracy data not found")
        return latest_doc["per_rice_type_metrics"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching accuracy data: {str(e)}")


# 📌 3. Forecast vs Actual Chart
@router.get("/forecast-vs-actual")
async def get_forecast_vs_actual_chart(
    rice_type: str = Query(..., description="Name of the rice type"),
    data_type: str = Query("test", description="Data type: 'test', 'actual', or 'forecast'"),
    current_admin: dict = Depends(get_current_admin)
):
    try:
        query = {"rice_type": rice_type, "type": data_type}
        projection = {"_id": 0, "date": 1, "actual": 1, "forecast": 1}
        cursor = chart_collection.find(query, projection).sort("date", 1)
        data = await cursor.to_list(length=100)
        if not data:
            raise HTTPException(status_code=404, detail="No chart data found for this rice type")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chart data: {str(e)}")


# 📌 4. Forecast Run History
@router.get("/run-history")
async def get_forecast_run_history(current_admin: dict = Depends(get_current_admin)):
    try:
        cursor = accuracy_collection.find(
            {},
            projection={
                "_id": 0,
                "training_date": 1,
                "model_name": 1,
                "forecast_horizon_days": 1,
                "total_rice_types_modeled": 1,
                "total_records_used": 1,
                "date_range": 1
            }
        ).sort("training_date", -1)

        history = await cursor.to_list(length=50)
        if not history:
            raise HTTPException(status_code=404, detail="No forecast run history found")

        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching forecast run history: {str(e)}")


# 📌 5. MAE and R² Score Trend
@router.get("/mae-r2-trend")
async def get_mae_r2_trend(
    rice_type: str = Query(..., description="Rice type to filter by"),
    current_admin: dict = Depends(get_current_admin)
):
    try:
        # Project training_date, and filter matching rice type from each record
        cursor = accuracy_collection.find(
            {"per_rice_type_metrics.rice_type": rice_type},
            {
                "_id": 0,
                "training_date": 1,
                "per_rice_type_metrics": {
                    "$filter": {
                        "input": "$per_rice_type_metrics",
                        "as": "metric",
                        "cond": {"$eq": ["$$metric.rice_type", rice_type]}
                    }
                }
            }
        ).sort("training_date", 1)

        docs = await cursor.to_list(length=50)
        trend_data = []

        for doc in docs:
            if doc["per_rice_type_metrics"]:
                metrics = doc["per_rice_type_metrics"][0]
                trend_data.append({
                    "training_date": doc["training_date"],
                    "mae": metrics.get("mae", 0),
                    "r2_score": metrics.get("r2_score", 0)
                })

        if not trend_data:
            raise HTTPException(status_code=404, detail="No trend data found for this rice type")

        return trend_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching MAE/R2 trend: {str(e)}")
