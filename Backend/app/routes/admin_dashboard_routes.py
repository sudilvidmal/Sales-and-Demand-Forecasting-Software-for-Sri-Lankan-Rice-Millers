from fastapi import APIRouter, HTTPException, Depends
from app.database import database
from app.utils.auth import get_current_admin  # 🔐 Admin session dependency

router = APIRouter()

# MongoDB Collections
users_collection = database.get_collection("users")
admins_collection = database.get_collection("admins")
upload_data_collection = database.get_collection("test_upload_data")
forecast_accuracy_collection = database.get_collection("forecast_accuracy")


@router.get("/model-summary")
async def get_model_summary(current_admin: dict = Depends(get_current_admin)):
    """
    Returns the average MAE and R² (as percentage) from the latest forecast run.
    Requires valid admin token.
    """
    try:
        latest_doc = await forecast_accuracy_collection.find_one(
            sort=[("training_date", -1)],
            projection={
                "_id": 0,
                "training_date": 1,
                "model_name": 1,
                "per_rice_type_metrics": 1
            }
        )

        if not latest_doc or "per_rice_type_metrics" not in latest_doc:
            raise HTTPException(status_code=404, detail="No model performance data found")

        metrics = latest_doc["per_rice_type_metrics"]

        if not isinstance(metrics, list) or not metrics:
            return {"mape": 0.0, "r2_percentage": 0.0}

        valid_maes = [m["mae"] for m in metrics if isinstance(m.get("mae"), (int, float))]
        valid_r2s = [m["r2_score"] for m in metrics if isinstance(m.get("r2_score"), (int, float))]

        avg_mae = round(sum(valid_maes) / len(valid_maes), 2) if valid_maes else 0.0
        avg_r2_percentage = round((sum(valid_r2s) / len(valid_r2s)) * 100, 1) if valid_r2s else 0.0

        return {
            "mape": avg_mae,
            "r2_percentage": avg_r2_percentage
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching model performance summary: {str(e)}")


@router.get("/admin-stats")
async def get_admin_dashboard_stats(current_admin: dict = Depends(get_current_admin)):
    """
    Returns dashboard statistics for the admin panel.
    Requires valid admin token.
    """
    try:
        # Total Users (in `users` collection)
        total_users = await users_collection.count_documents({})

        # Admin Count (in `admins` collection)
        admin_count = await admins_collection.count_documents({})

        # Regular User Count (from users)
        user_count = total_users

        # Distinct Rice Types
        rice_types = await upload_data_collection.distinct("rice_type")
        rice_type_count = len(rice_types)

        # Active Forecast Models (latest forecast = active)
        active_models = await forecast_accuracy_collection.count_documents({})

        # Simulated account status (replace with real logic if needed)
        active_accounts = user_count + admin_count
        inactive_accounts = 0

        return {
            "totalUsers": user_count,
            "adminCount": admin_count,
            "userCount": user_count,
            "riceTypes": rice_type_count,
            "activeModels": active_models,
            "activeAccounts": active_accounts,
            "inactiveAccounts": inactive_accounts,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dashboard stats: {str(e)}")
