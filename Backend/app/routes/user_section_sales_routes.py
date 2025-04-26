from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime, timedelta
from app.database import test_upload_data_collection
from app.utils.auth import get_current_user  # 🔐 JWT dependency

router = APIRouter()

@router.get("/sales/kpi")
async def get_sales_kpi(current_user: dict = Depends(get_current_user)):
    try:
        today_str = datetime.now().strftime("%Y-%m-%d")
        current_month = datetime.now().strftime("%Y-%m")

        pipeline = [
            {
                "$group": {
                    "_id": "$date",
                    "daily_total": {"$sum": "$quantity_kg"},
                    "daily_revenue": {"$sum": "$gross_amount"}
                }
            }
        ]

        date_aggregates = await test_upload_data_collection.aggregate(pipeline).to_list(None)
        total_days = len(date_aggregates)
        total_all = sum(d["daily_total"] for d in date_aggregates)
        total_revenue = sum(d["daily_revenue"] for d in date_aggregates)
        avg_daily = total_all // total_days if total_days > 0 else 0

        today_sales = await test_upload_data_collection.aggregate([
            {"$match": {"date": today_str}},
            {"$group": {"_id": None, "total": {"$sum": "$quantity_kg"}}}
        ]).to_list(1)
        total_today = today_sales[0]["total"] if today_sales else 0

        month_sales = await test_upload_data_collection.aggregate([
            {"$match": {"date": {"$regex": f"^{current_month}"}}},
            {"$group": {"_id": None, "total": {"$sum": "$quantity_kg"}}}
        ]).to_list(1)
        total_month = month_sales[0]["total"] if month_sales else 0

        rice_summary = await test_upload_data_collection.aggregate([
            {
                "$group": {
                    "_id": "$rice_type",
                    "total_qty": {"$sum": "$quantity_kg"}
                }
            },
            {"$sort": {"total_qty": -1}}
        ]).to_list(None)

        best_rice = rice_summary[0]["_id"] if rice_summary else "N/A"
        worst_rice = rice_summary[-1]["_id"] if rice_summary else "N/A"

        return {
            "totalToday": total_today,
            "totalMonth": total_month,
            "totalAll": total_all,
            "revenue": total_revenue,
            "avgDaily": avg_daily,
            "bestRice": best_rice,
            "worstRice": worst_rice,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales/charts")
async def get_sales_charts(current_user: dict = Depends(get_current_user)):
    try:
        cutoff_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

        rice_type_agg = await test_upload_data_collection.aggregate([
            {"$group": {
                "_id": "$rice_type",
                "total_qty": {"$sum": "$quantity_kg"}
            }},
            {"$sort": {"total_qty": -1}}
        ]).to_list(None)

        bar_labels = [item["_id"] for item in rice_type_agg]
        bar_data = [item["total_qty"] for item in rice_type_agg]

        line_agg = await test_upload_data_collection.aggregate([
            {
                "$match": {
                    "date": {"$gte": cutoff_date}
                }
            },
            {"$group": {
                "_id": "$date",
                "daily_qty": {"$sum": "$quantity_kg"}
            }},
            {"$sort": {"_id": 1}}
        ]).to_list(None)

        line_labels = [item["_id"] for item in line_agg]
        line_data = [item["daily_qty"] for item in line_agg]

        return {
            "bar": {
                "labels": bar_labels,
                "data": bar_data
            },
            "pie": {
                "labels": bar_labels,
                "data": bar_data
            },
            "line": {
                "labels": line_labels,
                "data": line_data
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales/table")
async def get_sales_table(
    rice_type: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    price: Optional[str] = None,
    closed: Optional[str] = "All",
    sort_field: str = "date",
    sort_order: str = "asc",
    page: int = 1,
    limit: int = 8,
    current_user: dict = Depends(get_current_user)
):
    try:
        query = {}

        if rice_type and rice_type != "All":
            query["rice_type"] = rice_type

        if from_date:
            query["date"] = {"$gte": from_date}
        if to_date:
            query.setdefault("date", {})["$lte"] = to_date

        if price:
            try:
                price_val = float(price)
                query["price_per_kg"] = price_val
            except ValueError:
                pass

        if closed == "Closed":
            query["closed"] = True
        elif closed == "Open":
            query["closed"] = False

        sort_dir = 1 if sort_order == "asc" else -1
        skip = (page - 1) * limit

        cursor = (
            test_upload_data_collection
            .find(query)
            .sort(sort_field, sort_dir)
            .skip(skip) 
            .limit(limit)
        )
        results = await cursor.to_list(length=limit)
        for item in results:
            item["_id"] = str(item["_id"])

        total_count = await test_upload_data_collection.count_documents(query)

        return {
            "data": results,
            "total": total_count,
            "page": page,
            "pages": (total_count + limit - 1) // limit
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales/alerts")
async def get_sales_alerts(current_user: dict = Depends(get_current_user)):
    try:
        cutoff_date = (datetime.today() - timedelta(days=14)).strftime("%Y-%m-%d")

        raw_data = await test_upload_data_collection.aggregate([
            {"$match": {"date": {"$gte": cutoff_date}}},
            {
                "$group": {
                    "_id": {"date": "$date", "rice_type": "$rice_type"},
                    "quantity": {"$sum": "$quantity_kg"}
                }
            },
            {"$sort": {"_id.date": 1}}
        ]).to_list(None)

        from collections import defaultdict
        rice_history = defaultdict(dict)
        for entry in raw_data:
            rice = entry["_id"]["rice_type"]
            date = entry["_id"]["date"]
            rice_history[rice][date] = entry["quantity"]

        alerts = []

        for rice_type, date_sales in rice_history.items():
            sorted_dates = sorted(date_sales.keys())
            for i in range(7, len(sorted_dates)):
                recent_dates = sorted_dates[i - 7:i]
                current_date = sorted_dates[i]
                current_qty = date_sales[current_date]
                recent_avg = sum(date_sales[d] for d in recent_dates) / 7

                if recent_avg == 0:
                    continue

                ratio = current_qty / recent_avg

                if ratio > 1.5:
                    alerts.append({
                        "date": current_date,
                        "riceType": rice_type,
                        "message": f"🚀 Sales spike of {int(ratio * 100)}% detected."
                    })
                elif ratio < 0.5:
                    alerts.append({
                        "date": current_date,
                        "riceType": rice_type,
                        "message": f"📉 Sales drop of {int((1 - ratio) * 100)}% detected."
                    })

        alerts.sort(key=lambda x: x["date"], reverse=True)
        return alerts[:10]

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
