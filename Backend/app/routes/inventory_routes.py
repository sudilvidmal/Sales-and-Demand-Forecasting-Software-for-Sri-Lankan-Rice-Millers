from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime
from collections import defaultdict
from bson.regex import Regex
from bson import ObjectId
from app.database import inventory_collection, test_upload_data_collection
from app.utils.auth import get_current_user
from app.utils.logger import log_system_event  # ✅ NEW - import the logger!
from app.utils.logger import log_system_event 

router = APIRouter()

# 📥 Inventory Item Model
class InventoryItem(BaseModel):
    riceType: str
    quantity: int
    batchNo: str
    warehouse: str
    dateReceived: str

# ✅ Route to Add Multiple Inventory Items
@router.post("/inventory/bulk-add")
async def add_inventory_bulk(
    items: List[InventoryItem],
    current_user: dict = Depends(get_current_user)  # 🔒 JWT protected
):
    try:
        if not items:
            raise HTTPException(status_code=400, detail="No inventory items provided.")

        # ✅ Insert inventory records
        await inventory_collection.insert_many([item.dict() for item in items])

        # ✅ Log the inventory bulk upload event into system_logs
        await log_system_event(
            event_type="stock_upload",  # 📦 New event type (you can track it separately)
            description=f"Bulk inventory upload of {len(items)} items by {current_user['email']}",  # 👤 Add user info
            event_date=datetime.now().strftime("%Y-%m-%d"),
            extra_data={"count": len(items)}
        )

        return {"message": "✅ Inventory items added successfully", "count": len(items)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
# 📊 Route to Get Inventory Stats (For Dashboard Cards)
@router.get("/inventory/stats")
async def get_inventory_stats(current_user: dict = Depends(get_current_user)):
    try:
        today = datetime.today().strftime("%Y-%m-%d")
        current_month = datetime.today().strftime("%Y-%m")

        pipeline_total_quantity = [
            {"$group": {"_id": None, "totalQuantity": {"$sum": "$quantity"}}}
        ]
        total_quantity_result = await inventory_collection.aggregate(pipeline_total_quantity).to_list(1)
        total_quantity = total_quantity_result[0]["totalQuantity"] if total_quantity_result else 0

        rice_types = await inventory_collection.distinct("riceType")
        total_types = len(rice_types)

        batches_today = await inventory_collection.count_documents({"dateReceived": today})
        batches_this_month = await inventory_collection.count_documents({
            "dateReceived": Regex(f"^{current_month}")
        })
        low_stock_count = await inventory_collection.count_documents({"quantity": {"$lt": 50}})

        return {
            "totalTypes": total_types,
            "totalQuantity": total_quantity,
            "batchesToday": batches_today,
            "batchesThisMonth": batches_this_month,
            "lowStockCount": low_stock_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 📦 Route to Fetch All Inventory Items
@router.get("/inventory/all")
async def get_all_inventory(current_user: dict = Depends(get_current_user)):
    try:
        inventory_data = await inventory_collection.find().sort("dateReceived", -1).to_list(length=1000)
        for item in inventory_data:
            item["_id"] = str(item["_id"])
        return inventory_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🧮 Route to Analyze Inventory Depletion After Sales
@router.get("/inventory/depletion")
async def get_inventory_depletion(current_user: dict = Depends(get_current_user)):
    try:
        inventory_records = await inventory_collection.find({}).to_list(1000)
        sales_records = await test_upload_data_collection.find({}).to_list(5000)

        sales_totals = defaultdict(float)
        for sale in sales_records:
            rice_type = sale.get("rice_type")
            qty = float(sale.get("quantity_kg", 0))
            sales_totals[rice_type] += qty

        depletion_data = []
        for record in inventory_records:
            rice_type = record.get("riceType")
            initial_stock = float(record.get("quantity", 0))
            date_received = record.get("dateReceived", "N/A")
            used = sales_totals.get(rice_type, 0)
            remaining = max(initial_stock - used, 0)

            if remaining > 20:
                status = "Healthy"
            elif remaining > 0:
                status = "Low"
            else:
                status = "Out of Stock"

            depletion_data.append({
                "riceType": rice_type,
                "initialStock": initial_stock,
                "dateReceived": date_received,
                "usedSoFar": round(used, 2),
                "remainingStock": round(remaining, 2),
                "status": status
            })

        # ✅ Log that depletion analysis was performed
        await log_system_event(
            event_type="stock_sync",
            description="Inventory depletion analyzed and synced",
            event_date=datetime.now().strftime("%Y-%m-%d")
        )

        return {"data": depletion_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 📊 Route to Generate Pie Chart Data
@router.get("/inventory/pie")
async def get_inventory_pie(current_user: dict = Depends(get_current_user)):
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$riceType",
                    "total": {"$sum": "$quantity"}
                }
            },
            {"$sort": {"total": -1}}
        ]
        results = await inventory_collection.aggregate(pipeline).to_list(None)
        labels = [r["_id"] for r in results]
        data = [r["total"] for r in results]
        return {"labels": labels, "datasets": [{"data": data}]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 📈 Route to Generate Line Chart Data
@router.get("/inventory/line")
async def get_inventory_line(current_user: dict = Depends(get_current_user)):
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$dateReceived",
                    "total": {"$sum": "$quantity"}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        results = await inventory_collection.aggregate(pipeline).to_list(None)
        labels = [r["_id"] for r in results]
        data = [r["total"] for r in results]
        return {"labels": labels, "datasets": [{"label": "Stock Added (KG)", "data": data}]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
