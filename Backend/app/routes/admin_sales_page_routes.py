from fastapi import APIRouter, HTTPException, Query, Body, Depends
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.database import test_upload_data_collection
from app.utils.auth import get_current_admin  # 🔐 Import admin JWT auth

router = APIRouter()

# 📊 Sales KPI Endpoint (JWT protected)
@router.get("/kpi")
async def get_admin_sales_kpi(current_admin: dict = Depends(get_current_admin)):
    try:
        today_str = datetime.now().strftime("%Y-%m-%d")

        today_agg = await test_upload_data_collection.aggregate([
            {"$match": {"date": today_str}},
            {
                "$group": {
                    "_id": None,
                    "total_sales": {"$sum": "$quantity_kg"},
                    "total_revenue": {"$sum": "$gross_amount"}
                }
            }
        ]).to_list(1)

        total_sales_today = today_agg[0]["total_sales"] if today_agg else 0
        total_revenue_today = today_agg[0]["total_revenue"] if today_agg else 0

        daily_sales_agg = await test_upload_data_collection.aggregate([
            {
                "$group": {
                    "_id": "$date",
                    "daily_sales": {"$sum": "$quantity_kg"}
                }
            }
        ]).to_list(None)

        total_days = len(daily_sales_agg)
        total_all_sales = sum(day["daily_sales"] for day in daily_sales_agg)
        average_daily_sales = round(total_all_sales / total_days, 2) if total_days > 0 else 0

        rice_type_agg = await test_upload_data_collection.aggregate([
            {
                "$group": {
                    "_id": "$rice_type",
                    "total_qty": {"$sum": "$quantity_kg"}
                }
            },
            {"$sort": {"total_qty": -1}}
        ]).to_list(None)

        best_selling = rice_type_agg[0]["_id"] if rice_type_agg else "N/A"
        least_selling = rice_type_agg[-1]["_id"] if rice_type_agg else "N/A"

        return {
            "totalSalesToday": total_sales_today,
            "totalRevenueToday": total_revenue_today,
            "averageDailySales": average_daily_sales,
            "bestSellingRice": best_selling,
            "leastSellingRice": least_selling
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch KPI data.")


# 📋 Sales Table Endpoint (JWT protected)
@router.get("/table")
async def get_admin_sales_table(
    rice_type: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    price: Optional[str] = Query(None),
    closed: Optional[str] = Query("All"),
    current_admin: dict = Depends(get_current_admin)
):
    try:
        query = {}

        if rice_type:
            query["rice_type"] = rice_type

        if from_date:
            query["date"] = {"$gte": from_date}
        if to_date:
            query.setdefault("date", {})["$lte"] = to_date

        if price:
            try:
                query["price_per_kg"] = float(price)
            except ValueError:
                pass

        if closed == "Closed":
            query["closed"] = True
        elif closed == "Open":
            query["closed"] = False

        cursor = test_upload_data_collection.find(query).sort("date", -1)
        results = await cursor.to_list(length=500)

        for record in results:
            record["_id"] = str(record["_id"])

        return {"data": results}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to load sales table data.")


# ✏️ Update Sales Record (JWT protected)
@router.put("/update/{record_id}")
async def update_sales_record(
    record_id: str,
    updated_fields: dict = Body(...),
    current_admin: dict = Depends(get_current_admin)
):
    try:
        allowed_fields = {"quantity_kg", "gross_amount", "price_per_kg"}
        update_data = {k: v for k, v in updated_fields.items() if k in allowed_fields}

        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update.")

        result = await test_upload_data_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Record not found.")

        return {"message": "✅ Sales record updated successfully."}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="❌ Failed to update record.")
