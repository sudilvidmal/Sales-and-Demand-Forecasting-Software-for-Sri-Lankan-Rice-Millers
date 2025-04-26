const reportTemplate = {
  summary: {
    total_sales_kg: 45200,
    total_revenue: 3185000,
    most_sold: "SIERRA RED RAW RICE -5KG",
    least_sold: "SAUMYA WHITE NADU RICE 25KG",
    avg_per_day: 1459,
    from_date: "2024-01-01",
    to_date: "2024-03-31",
    rice_type_filter: "All",
    date_range_days: 90,
    latest_forecast_run: "2025-04-12 15:30:00",
  },
  accuracy: {
    model_name: "XGBoost + LightGBM Hybrid",
    training_date: "2025-04-12",
    forecast_horizon: 30,
    total_rice_types_modeled: 11,
    total_records_used: 2742,
    training_date_range: {
      start: "2024-01-01",
      end: "2024-12-31",
    },
    per_rice_type: [
      { rice_type: "RED RAW -5KG", r2: 0.91, mape: 6.3 },
      { rice_type: "WHITE BASMATHI -10KG", r2: 0.86, mape: 8.1 },
    ],
  },
  forecastTable: [
    {
      Date: "2025-04-14",
      "Rice Type": "RED RAW -5KG",
      "Actual Sales (KG)": 29.5,
      "Forecasted Sales (KG)": 28.1,
      Accuracy: "95.2%",
    },
    {
      Date: "2025-04-15",
      "Rice Type": "RED RAW -5KG",
      "Actual Sales (KG)": 32.1,
      "Forecasted Sales (KG)": 30.2,
      Accuracy: "94.0%",
    },
  ],
  inventoryImpact: [
    {
      riceType: "RED RAW -5KG",
      current_stock_kg: 6000,
      forecast_30_days_qty: 850,
      post_forecast_stock_kg: 5150,
      status: "✅ Healthy",
    },
    {
      riceType: "WHITE RAW -25KG",
      current_stock_kg: 0,
      forecast_30_days_qty: 350,
      post_forecast_stock_kg: -350,
      status: "🛑 Critical",
    },
  ],
  riceBreakdown: [
    {
      riceType: "RED RAW -5KG",
      total_quantity_sold: 4100,
      total_revenue: 512500,
      avg_price_per_kg: 125,
      active_days: 25,
    },
    {
      riceType: "WHITE BASMATHI -10KG",
      total_quantity_sold: 1800,
      total_revenue: 342000,
      avg_price_per_kg: 190,
      active_days: 20,
    },
  ],
  inventoryDistribution: [
    {
      riceType: "RED RAW -5KG",
      quantity: 2500,
      warehouse: "Pannipitiya",
      batchNo: "B001",
      dateReceived: "2025-04-01",
    },
    {
      riceType: "RED RAW -5KG",
      quantity: 3500,
      warehouse: "Kurunegala",
      batchNo: "B002",
      dateReceived: "2025-04-02",
    },
  ],
};

export default reportTemplate;
