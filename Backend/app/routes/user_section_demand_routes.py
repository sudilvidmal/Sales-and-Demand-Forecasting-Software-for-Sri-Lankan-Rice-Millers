from fastapi import APIRouter, Depends, HTTPException, Query
from app.database import database
from app.utils.auth import get_current_user

router = APIRouter()
demand_collection = database.get_collection("rice_forecasts")

# 🟰 1. Demand Summary (KPIs)
@router.get("/summary")
async def get_demand_summary(current_user: dict = Depends(get_current_user)):
    try:
        docs = await demand_collection.find({}).to_list(length=None)
        if not docs:
            raise HTTPException(status_code=404, detail="No forecast data found.")

        total_demand = sum(doc.get("Predicted Quantity (KG)", 0) for doc in docs)
        unique_dates = set(doc.get("Date") for doc in docs)
        avg_per_day = total_demand / len(unique_dates) if unique_dates else 0

        rice_totals = {}
        for doc in docs:
            rice_type = doc.get("Rice Type")
            qty = doc.get("Predicted Quantity (KG)", 0)
            if rice_type:
                rice_totals[rice_type] = rice_totals.get(rice_type, 0) + qty

        top_rice_type, top_rice_total = (None, 0)
        if rice_totals:
            top_rice_type, top_rice_total = max(rice_totals.items(), key=lambda x: x[1])

        return {
            "total_demand": round(total_demand, 2),
            "average_per_day": round(avg_per_day, 2),
            "top_rice_type": top_rice_type,
            "top_rice_total": round(top_rice_total, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# 🟰 2. Demand Table
@router.get("/table")
async def get_demand_table(
    days: int = Query(30, description="Number of days to filter (30, 60, or 90)"),
    current_user: dict = Depends(get_current_user)
):
    try:
        docs = await demand_collection.find({}).to_list(length=None)
        if not docs:
            raise HTTPException(status_code=404, detail="No forecast data found.")

        sorted_docs = sorted(docs, key=lambda x: x.get("Date", ""))
        filtered_docs = sorted_docs[:days]

        rice_totals = {}
        for doc in filtered_docs:
            rice_type = doc.get("Rice Type")
            qty = doc.get("Predicted Quantity (KG)", 0)
            if rice_type:
                rice_totals[rice_type] = rice_totals.get(rice_type, 0) + qty

        table_data = sorted(
            [{"rice_type": k, "total_qty": round(v, 2)} for k, v in rice_totals.items()],
            key=lambda x: x["total_qty"],
            reverse=True
        )

        return {
            "days": days,
            "data": table_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# 🟰 3. Demand Distribution (Pie Chart)
@router.get("/distribution")
async def get_demand_distribution(
    days: int = Query(30, description="Number of days to filter (30, 60, or 90)"),
    current_user: dict = Depends(get_current_user)
):
    try:
        docs = await demand_collection.find({}).to_list(length=None)
        if not docs:
            raise HTTPException(status_code=404, detail="No forecast data found.")

        sorted_docs = sorted(docs, key=lambda x: x.get("Date", ""))
        filtered_docs = sorted_docs[:days]

        rice_totals = {}
        for doc in filtered_docs:
            rice_type = doc.get("Rice Type")
            qty = doc.get("Predicted Quantity (KG)", 0)
            if rice_type:
                rice_totals[rice_type] = rice_totals.get(rice_type, 0) + qty

        distribution_data = sorted(
            [{"rice_type": rice_type, "total_qty": round(total_qty, 2)}
             for rice_type, total_qty in rice_totals.items()],
            key=lambda x: x["total_qty"],
            reverse=True
        )

        return {
            "days": days,
            "data": distribution_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
