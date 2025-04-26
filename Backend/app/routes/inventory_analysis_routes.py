from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from collections import defaultdict
from app.database import (
    inventory_collection,
    forecast_collection,
    test_upload_data_collection,
    database
)
from app.utils.auth import get_current_user  # 🔐 JWT dependency

router = APIRouter()
inventory_analysis_collection = database.get_collection("inventory_analysis")

def get_next_30_days():
    today = datetime.today().date()
    return [(today + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(30)]

@router.get("/inventory/analysis")
async def analyze_remaining_inventory(current_user: dict = Depends(get_current_user)):
    try:
        next_30_days = get_next_30_days()

        # 1️⃣ Forecast Data
        forecast_cursor = forecast_collection.find({
            "Date": {"$in": next_30_days}
        })
        forecast_totals = defaultdict(float)
        async for doc in forecast_cursor:
            forecast_totals[doc["Rice Type"]] += float(doc.get("Predicted Quantity (KG)", 0))

        # 2️⃣ Inventory per rice type
        inventory_records = await inventory_collection.find({}).to_list(1000)
        inventory_totals = defaultdict(float)
        for record in inventory_records:
            inventory_totals[record["riceType"]] += float(record.get("quantity", 0))

        # 3️⃣ Sales Totals (used so far)
        sales_records = await test_upload_data_collection.find({}).to_list(5000)
        sales_totals = defaultdict(float)
        for sale in sales_records:
            rice_type = sale.get("rice_type")
            qty = float(sale.get("quantity_kg", 0))
            sales_totals[rice_type] += qty

        # 4️⃣ Process result
        all_rice_types = set(forecast_totals) | set(inventory_totals)
        now = datetime.now().isoformat()
        results = []

        for rice in all_rice_types:
            forecast_qty = forecast_totals.get(rice, 0)
            inventory_qty = inventory_totals.get(rice, 0)
            used_so_far = sales_totals.get(rice, 0)

            remaining_stock = max(inventory_qty - used_so_far, 0)
            post_forecast_stock = remaining_stock - forecast_qty

            if post_forecast_stock > 20:
                status = "✅ Healthy"
            elif post_forecast_stock > 0:
                status = "⚠️ Low"
            else:
                status = "🛑 Critical"

            doc = {
                "riceType": rice,
                "current_stock_kg": round(remaining_stock, 2),
                "forecast_30_days_qty": round(forecast_qty, 2),
                "post_forecast_stock_kg": round(post_forecast_stock, 2),
                "status": status,
                "last_updated": now
            }

            await inventory_analysis_collection.update_one(
                {"riceType": rice},
                {"$set": doc},
                upsert=True
            )
            results.append(doc)

        return {"message": "Inventory analysis completed", "data": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
