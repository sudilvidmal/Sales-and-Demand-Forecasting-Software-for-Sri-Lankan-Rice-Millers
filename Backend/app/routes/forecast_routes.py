from fastapi import APIRouter, HTTPException, Query, Depends
from app.database import database
from app.utils.auth import get_current_user  # 🔐 JWT Dependency

router = APIRouter()
forecast_collection = database.get_collection("rice_forecasts")

@router.get("/forecast")
async def get_forecast(
    rice_type: str = Query(..., alias="riceType"),
    current_user: dict = Depends(get_current_user)  # ✅ JWT verification
):
    try:
        docs = await forecast_collection.find({"Rice Type": rice_type}).to_list(length=None)

        if not docs:
            raise HTTPException(status_code=404, detail="No forecast data found for this rice type.")

        forecasts = [
            {
                "date": doc["Date"], 
                "quantity": doc["Predicted Quantity (KG)"]
            }
            for doc in docs
        ]

        return {
            "rice_type": rice_type,
            "forecasts": forecasts
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
