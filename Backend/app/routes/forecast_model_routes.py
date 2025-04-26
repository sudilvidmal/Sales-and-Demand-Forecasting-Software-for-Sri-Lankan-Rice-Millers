# app/routes/forecast_model_routes.py

from fastapi import APIRouter, Depends, HTTPException
from app.utils.forecast_model import run_forecasting
from app.utils.auth import get_current_user  # 🔐 JWT auth dependency
from app.utils.logger import log_system_event

router = APIRouter()

@router.post("/run-forecast")
async def forecast(current_user: dict = Depends(get_current_user)):
    try:
        result = run_forecasting()

        # ✅ After successful forecast, log it
        await log_system_event(
            event_type="forecast_generated",
            description="New sales forecast generated successfully"
        )

        return {"message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting failed: {str(e)}")
