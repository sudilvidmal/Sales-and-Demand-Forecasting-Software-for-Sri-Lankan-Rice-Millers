from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from pymongo import ASCENDING, DESCENDING
from app.database import database
from app.utils.auth import get_current_user  # 🔐 JWT Dependency

router = APIRouter()
upload_collection = database.get_collection("test_upload_data")


class SearchRequest(BaseModel):
    rice_type: Optional[str]
    from_date: Optional[str]
    to_date: Optional[str]


# 🔍 POST Search Data (JWT Protected)
@router.post("/search-data")
async def search_data(
    payload: SearchRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        query = {}

        if payload.rice_type:
            query["rice_type"] = payload.rice_type

        if payload.from_date or payload.to_date:
            query["date"] = {}
            if payload.from_date:
                query["date"]["$gte"] = payload.from_date
            if payload.to_date:
                query["date"]["$lte"] = payload.to_date

        results = await upload_collection.find(query).to_list(None)

        data = [
            {
                "date": doc["date"],
                "rice_type": doc["rice_type"],
                "quantity_kg": doc["quantity_kg"],
                "price_per_kg": doc["price_per_kg"],
            }
            for doc in results
            if not doc.get("closed", False)
        ]

        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# 📅 GET Date Range (JWT Protected)
@router.get("/data-range")
async def get_data_range(current_user: dict = Depends(get_current_user)):
    try:
        min_doc = await upload_collection.find_one(sort=[("date", ASCENDING)])
        max_doc = await upload_collection.find_one(sort=[("date", DESCENDING)])

        if not min_doc or not max_doc:
            return {"min_date": None, "max_date": None}

        return {
            "min_date": min_doc.get("date"),
            "max_date": max_doc.get("date"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data range: {str(e)}")
