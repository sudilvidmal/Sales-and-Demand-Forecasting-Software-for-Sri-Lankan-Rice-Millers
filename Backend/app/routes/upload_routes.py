from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from datetime import datetime
from pydantic import BaseModel
from typing import List
import pandas as pd
from io import BytesIO
from collections import defaultdict
from app.database import database
from app.utils.auth import get_current_user  # 🔐 JWT Dependency
from app.utils.logger import log_system_event  # ✨ NEW: Logger Utility

router = APIRouter()
upload_collection = database.get_collection("test_upload_data")

# ✅ RICE TYPES
rice_types = [
    "SIERRA RED RAW RICE -5KG", "SIERRA RED RAW RICE -10KG", "SIERRA RED RAW RICE -25KG",
    "SIERRA WHITE BASMATHI RICE -5KG", "SIERRA WHITE BASMATHI RICE -25KG",
    "SIERRA WHITE RAW RICE -5KG", "SIERRA WHITE RAW RICE -10KG", "SIERRA WHITE RAW RICE -25KG",
    "SAUMYA WHITE NADU RICE 5KG", "SAUMYA WHITE NADU RICE 10KG", "SAUMYA WHITE NADU RICE 25KG",
]

# ✅ Upload Excel Route
@router.post("/upload-excel")
async def upload_excel(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        if not file.filename.endswith((".xlsx", ".xls")):
            raise HTTPException(status_code=400, detail="Invalid file format")

        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))

        if df.empty:
            raise HTTPException(status_code=400, detail="The uploaded file is empty")

        csv_buffer = BytesIO()
        df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)
        df = pd.read_csv(csv_buffer)

        df['date'] = pd.to_datetime(df['Date'], errors='coerce').dt.strftime('%Y-%m-%d')
        df['closed'] = df['Quantity (KG)'].astype(str).str.lower().str.strip() == 'shop closs'
        df['quantity_kg'] = pd.to_numeric(df['Quantity (KG)'], errors='coerce').fillna(0)
        df['gross_amount'] = pd.to_numeric(df.get('Gross Amount', 0), errors='coerce').fillna(0)
        df['price_per_kg'] = pd.to_numeric(df.get('Amount per 1 KG', 0), errors='coerce').fillna(0)
        df.rename(columns={'Rice Type': 'rice_type'}, inplace=True)

        records = df[['date', 'rice_type', 'quantity_kg', 'gross_amount', 'price_per_kg', 'closed']].to_dict(orient='records')

        if not records:
            raise HTTPException(status_code=400, detail="No valid records to upload")

        await upload_collection.insert_many(records)

        # ✨ NEW: Log system event
        latest_date = max(df['date'])
        await log_system_event(
            event_type="sales_upload",
            description=f"Sales data uploaded for {latest_date}"
        )

        return {"msg": f"✅ Uploaded {len(records)} records successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

# ✅ Shop Closed Model
class ShopClosedRequest(BaseModel):
    date: str  # YYYY-MM-DD

# ✅ Shop Closed Route
@router.post("/shop-closed")
async def add_shop_closed(
    payload: ShopClosedRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        date_str = payload.date
        datetime.strptime(date_str, "%Y-%m-%d")

        records = [{
            "date": date_str,
            "rice_type": rice_type,
            "quantity_kg": 0,
            "gross_amount": 0,
            "price_per_kg": 0,
            "closed": True
        } for rice_type in rice_types]

        await upload_collection.insert_many(records)

        # ✨ NEW: Log system event
        await log_system_event(
            event_type="shop_closed",
            description=f"Shop closed for all rice types on {date_str}"
        )

        return {"msg": f"✅ {len(records)} shop closed records inserted for {date_str}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert shop closed records: {str(e)}")

# ✅ Manual Entry Model
class ManualEntry(BaseModel):
    date: str
    rice_type: str
    quantity_kg: float
    price_per_kg: float
    closed: bool = False

# ✅ Manual Entry Route
@router.post("/manual-entry")
async def manual_entry(
    records: List[ManualEntry],
    current_user: dict = Depends(get_current_user)
):
    try:
        if not records:
            raise HTTPException(status_code=400, detail="No records provided")

        grouped_by_date = defaultdict(list)
        for r in records:
            grouped_by_date[r.date].append(r)

        all_inserted = []
        all_filler = []

        for date, recs in grouped_by_date.items():
            submitted_rice_types = {r.rice_type for r in recs}
            has_sales = any(r.quantity_kg > 0 for r in recs)

            docs = [{
                "date": r.date,
                "rice_type": r.rice_type,
                "quantity_kg": r.quantity_kg,
                "price_per_kg": r.price_per_kg,
                "gross_amount": r.quantity_kg * r.price_per_kg,
                "closed": r.closed
            } for r in recs]

            await upload_collection.insert_many(docs)
            all_inserted.extend(docs)

            existing_docs = await upload_collection.find({"date": date}).to_list(None)
            existing_rice_types = {doc["rice_type"] for doc in existing_docs}

            all_present = submitted_rice_types.union(existing_rice_types)
            missing_types = set(rice_types) - all_present

            filler_docs = []
            for rt in missing_types:
                filler_docs.append({
                    "date": date,
                    "rice_type": rt,
                    "quantity_kg": 0,
                    "price_per_kg": 0,
                    "gross_amount": 0,
                    "closed": not has_sales
                })

            if filler_docs:
                await upload_collection.insert_many(filler_docs)
                all_filler.extend(filler_docs)

            # ✨ NEW: Log each manual entry date
            await log_system_event(
                event_type="manual_entry",
                description=f"Manual entry added for {date}"
            )

        return {
            "msg": f"✅ Inserted {len(all_inserted)} manual entries. Auto-filled {len(all_filler)} missing rice types."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert manual data: {str(e)}")
