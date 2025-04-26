from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel
from datetime import datetime
from app.database import inventory_collection, test_upload_data_collection, forecast_collection
from bson import ObjectId
from collections import defaultdict
from app.utils.auth import get_current_admin  # 🔐 Import admin auth dependency

router = APIRouter()

# ✅ Pydantic schema
class InventoryRecord(BaseModel):
    riceType: str
    quantity: int
    warehouse: str
    batchNo: str
    dateReceived: str

class InventoryOut(InventoryRecord):
    id: str

    @classmethod
    def from_mongo(cls, doc):
        return cls(
            id=str(doc["_id"]),
            riceType=doc["riceType"],
            quantity=doc["quantity"],
            warehouse=doc["warehouse"],
            batchNo=doc["batchNo"],
            dateReceived=doc["dateReceived"]
        )

# 📥 Add Inventory Record
@router.post("/add")
async def add_inventory_record(
    record: InventoryRecord, current_admin: dict = Depends(get_current_admin)
):
    try:
        result = await inventory_collection.insert_one(record.dict())
        return {"message": "Inventory added", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 📋 Get All Inventory Records
@router.get("/all")
async def get_all_inventory_records(current_admin: dict = Depends(get_current_admin)):
    try:
        records = await inventory_collection.find().sort("dateReceived", -1).to_list(1000)
        return {"data": [InventoryOut.from_mongo(doc) for doc in records]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✏️ Update Inventory Record
@router.put("/update/{record_id}")
async def update_inventory_record(
    record_id: str,
    update: InventoryRecord,
    current_admin: dict = Depends(get_current_admin)
):
    try:
        result = await inventory_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": update.dict()}
        )
        if result.modified_count:
            return {"message": "Inventory updated"}
        return {"message": "No changes made"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🗑️ Delete Inventory Record
@router.delete("/delete/{record_id}")
async def delete_inventory_record(
    record_id: str, current_admin: dict = Depends(get_current_admin)
):
    try:
        result = await inventory_collection.delete_one({"_id": ObjectId(record_id)})
        if result.deleted_count:
            return {"message": "Inventory deleted"}
        raise HTTPException(status_code=404, detail="Record not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ⚠️ Low Stock Monitor
@router.get("/low-stock")
async def get_low_stock_inventory(current_admin: dict = Depends(get_current_admin)):
    try:
        inventory_records = await inventory_collection.find({}).to_list(1000)
        sales_records = await test_upload_data_collection.find({}).to_list(5000)

        sales_totals = defaultdict(float)
        for sale in sales_records:
            rice_type = sale.get("rice_type")
            qty = float(sale.get("quantity_kg", 0))
            sales_totals[rice_type] += qty

        low_stock_items = []
        for record in inventory_records:
            rice_type = record.get("riceType")
            initial_stock = float(record.get("quantity", 0))
            date_received = record.get("dateReceived", "N/A")
            used = sales_totals.get(rice_type, 0)
            remaining = max(initial_stock - used, 0)

            if remaining < 50:
                low_stock_items.append({
                    "id": str(record["_id"]),
                    "riceType": rice_type,
                    "quantity": round(initial_stock, 2),
                    "warehouse": record.get("warehouse"),
                    "batchNo": record.get("batchNo"),
                    "dateReceived": date_received,
                    "usedSoFar": round(used, 2),
                    "remainingStock": round(remaining, 2),
                    "status": (
                        "Out of Stock" if remaining <= 0 else
                        "Low"
                    )
                })

        return {"data": low_stock_items}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 📊 Top Stocked Chart
@router.get("/top-stocked")
async def get_top_stocked_rice_types(current_admin: dict = Depends(get_current_admin)):
    try:
        pipeline = [
            {"$group": {"_id": "$riceType", "totalQuantity": {"$sum": "$quantity"}}},
            {"$sort": {"totalQuantity": -1}},
            {"$limit": 5}
        ]
        results = await inventory_collection.aggregate(pipeline).to_list(5)

        data = [
            {
                "riceType": item["_id"],
                "quantity": round(item["totalQuantity"], 2)
            }
            for item in results
        ]
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ⚡ Fast-Moving Rice Types
@router.get("/fast-moving")
async def get_fast_moving_rice_types(current_admin: dict = Depends(get_current_admin)):
    try:
        inventory_data = await inventory_collection.find({}).to_list(1000)

        initial_stock_totals = defaultdict(float)
        warehouse_map = {}
        for item in inventory_data:
            rice_type = item.get("riceType")
            qty = float(item.get("quantity", 0))
            initial_stock_totals[rice_type] += qty
            if rice_type not in warehouse_map:
                warehouse_map[rice_type] = item.get("warehouse", "")

        sales_records = await test_upload_data_collection.find({}).to_list(5000)
        sales_totals = defaultdict(float)
        sales_days = defaultdict(set)
        for record in sales_records:
            rice_type = record.get("rice_type")
            date = record.get("date")
            qty = float(record.get("quantity_kg", 0))
            sales_totals[rice_type] += qty
            if date:
                sales_days[rice_type].add(date)

        avg_daily_sales = {
            rice_type: round(sales_totals[rice_type] / len(sales_days[rice_type]), 2)
            for rice_type in sales_totals if len(sales_days[rice_type]) > 0
        }

        forecast_data = await forecast_collection.find({}).to_list(5000)
        forecast_totals = defaultdict(float)
        for f in forecast_data:
            rice_type = f.get("Rice Type")
            predicted_qty = float(f.get("Predicted Quantity (KG)", 0))
            forecast_totals[rice_type] += predicted_qty

        fast_moving_data = []
        for rice_type in initial_stock_totals:
            initial_stock = initial_stock_totals[rice_type]
            used = sales_totals.get(rice_type, 0.0)
            remaining_stock = round(max(initial_stock - used, 0.0), 2)
            avg_sales = round(avg_daily_sales.get(rice_type, 0.0), 1)
            forecast_30 = round(forecast_totals.get(rice_type, 0.0), 1)

            if remaining_stock < forecast_30 or remaining_stock < 50:
                fast_moving_data.append({
                    "riceType": rice_type,
                    "currentStock": remaining_stock,
                    "avgDailySales": avg_sales,
                    "forecast30Days": forecast_30,
                    "warehouse": warehouse_map.get(rice_type, ""),
                    "status": "Fast Moving"
                })

        return {"data": fast_moving_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
