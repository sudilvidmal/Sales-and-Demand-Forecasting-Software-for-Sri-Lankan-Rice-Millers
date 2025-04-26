def run_forecasting():
    import pandas as pd
    import numpy as np
    import lightgbm as lgb
    import xgboost as xgb
    from pymongo import MongoClient
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, r2_score
    from datetime import timedelta, datetime

    # MongoDB connection
    MONGO_URI = "mongodb+srv://punsarithvidmal:V4iqoY1DK7TeoAmH@salesforecastcluster.clqcmca.mongodb.net/?retryWrites=true&w=majority"
    client = MongoClient(MONGO_URI)
    collection = client["UserManagementDB"]["test_upload_data"]
    df_all = pd.DataFrame(list(collection.find()))

    # Clean data
    df_all['Date'] = pd.to_datetime(df_all['date'], errors='coerce')
    df_all['Rice Type'] = df_all['rice_type']
    df_all['Quantity (KG)'] = pd.to_numeric(df_all['quantity_kg'], errors='coerce').fillna(0)
    df_all['Gross Amount'] = pd.to_numeric(df_all['gross_amount'], errors='coerce').fillna(0)
    df_all['Price Per KG'] = pd.to_numeric(df_all['price_per_kg'], errors='coerce').fillna(0)
    df_all['Closed'] = df_all['closed'].astype(bool)
    df_all = df_all.dropna(subset=['Date', 'Rice Type'])
    df_all = df_all[~df_all['Closed']]

    # Holidays
    holiday_dates = pd.to_datetime([
        "2024-01-15", "2024-01-25", "2024-02-04", "2024-02-23", "2024-03-08", "2024-03-24",
        "2024-03-29", "2024-04-11", "2024-04-12", "2024-04-13", "2024-04-23", "2024-05-01",
        "2024-05-23", "2024-05-24", "2024-06-17", "2024-06-21", "2024-07-20", "2024-08-19",
        "2024-09-16", "2024-09-17", "2024-10-17", "2024-10-31", "2024-11-15", "2024-12-14", "2024-12-25"
    ])

    rice_types = df_all['Rice Type'].unique()
    forecast_collection = client["UserManagementDB"]["rice_forecasts"]
    chart_collection = client["UserManagementDB"]["forecast_chart_data"]
    accuracy_collection = client["UserManagementDB"]["forecast_accuracy"]

    results = []

    for rice in rice_types:
        df = df_all[df_all['Rice Type'] == rice].copy()
        if df.shape[0] < 100:
            continue

        df = df.sort_values('Date')
        df['Quantity (KG)'] = df['Quantity (KG)'].clip(upper=df['Quantity (KG)'].quantile(0.995))

        df['Year'] = df['Date'].dt.year
        df['Month'] = df['Date'].dt.month
        df['Day'] = df['Date'].dt.day
        df['Weekday'] = df['Date'].dt.weekday
        df['WeekOfYear'] = df['Date'].dt.isocalendar().week.astype(int)
        df['DayOfYear'] = df['Date'].dt.dayofyear
        df['IsWeekend'] = df['Weekday'].isin([5, 6]).astype(int)
        df['StartOfMonth'] = (df['Day'] <= 5).astype(int)
        df['EndOfMonth'] = (df['Day'] >= 25).astype(int)
        df['IsHoliday'] = df['Date'].isin(holiday_dates).astype(int)
        df['IsDayBeforeHoliday'] = df['Date'].shift(-1).isin(holiday_dates).astype(int)

        lags = [1, 2, 3, 7, 14, 21, 30]
        for lag in lags:
            df[f'lag_{lag}'] = df['Quantity (KG)'].shift(lag)

        df['rolling_mean_3'] = df['Quantity (KG)'].shift(1).rolling(3).mean()
        df['rolling_std_7'] = df['Quantity (KG)'].shift(1).rolling(7).std()
        df['rolling_trend'] = df['rolling_mean_3'] - df['Quantity (KG)'].shift(1).rolling(7).mean()
        df['weekly_diff'] = df['Quantity (KG)'] - df['Quantity (KG)'].shift(7)

        df = df.dropna().reset_index(drop=True)
        if df.shape[0] < 50:
            continue

        features = [
            'Year', 'Month', 'Day', 'Weekday', 'WeekOfYear', 'DayOfYear',
            'IsWeekend', 'StartOfMonth', 'EndOfMonth', 'IsHoliday', 'IsDayBeforeHoliday',
            'Gross Amount', 'Price Per KG',
            'rolling_mean_3', 'rolling_std_7', 'rolling_trend', 'weekly_diff'
        ] + [f'lag_{l}' for l in lags]

        X = df[features].astype(np.float32)
        y = np.log1p(df['Quantity (KG)'])

        X_train, X_test, y_train, y_test = train_test_split(X, y, shuffle=False, test_size=0.2)
        model_xgb = xgb.XGBRegressor(n_estimators=200, max_depth=8, learning_rate=0.05, subsample=0.8)
        model_lgb = lgb.LGBMRegressor(n_estimators=200, max_depth=8, learning_rate=0.05, subsample=0.8)

        model_xgb.fit(X_train, y_train)
        model_lgb.fit(X_train, y_train, eval_set=[(X_test, y_test)],
                      callbacks=[lgb.early_stopping(10), lgb.log_evaluation(period=0)])

        pred_blend = (np.expm1(model_xgb.predict(X_test)) + np.expm1(model_lgb.predict(X_test))) / 2
        y_true = np.expm1(y_test)
        mae = mean_absolute_error(y_true, pred_blend)
        r2 = r2_score(y_true, pred_blend)

        results.append({'Rice Type': rice, 'MAE (KG)': mae, 'R² Score': r2})

        # 🔁 Save test set chart data
        chart_collection.delete_many({'rice_type': rice, 'type': 'test'})
        test_dates = df.iloc[X_test.index]['Date'].reset_index(drop=True)
        chart_collection.insert_many([
            {
                "rice_type": rice,
                "date": test_dates[i].strftime('%Y-%m-%d'),
                "actual": round(y_true.iloc[i], 2),
                "forecast": round(pred_blend[i], 2),
                "type": "test"
            }
            for i in range(len(test_dates))
        ])

        # 🔮 Forecast 30 future days
        forecast_horizon = 90
        last_date = df['Date'].max()
        future_dates = [last_date + timedelta(days=i) for i in range(1, forecast_horizon + 1)]
        forecast_rows = []

        for date in future_dates:
            row = {
                'Date': date,
                'Year': date.year,
                'Month': date.month,
                'Day': date.day,
                'Weekday': date.weekday(),
                'WeekOfYear': date.isocalendar().week,
                'DayOfYear': date.timetuple().tm_yday,
                'IsWeekend': int(date.weekday() in [5, 6]),
                'StartOfMonth': int(date.day <= 5),
                'EndOfMonth': int(date.day >= 25),
                'IsHoliday': int(date in holiday_dates),
                'IsDayBeforeHoliday': int((date + timedelta(days=1)) in holiday_dates),
            }

            recent = df[df['Date'] < date].sort_values('Date').tail(30)
            for lag in lags:
                row[f'lag_{lag}'] = recent['Quantity (KG)'].iloc[-lag] if len(recent) >= lag else 0
            row['rolling_mean_3'] = recent['Quantity (KG)'].tail(3).mean()
            row['rolling_std_7'] = recent['Quantity (KG)'].tail(7).std()
            row['rolling_trend'] = row['rolling_mean_3'] - recent['Quantity (KG)'].tail(7).mean()
            row['weekly_diff'] = recent['Quantity (KG)'].iloc[-1] - recent['Quantity (KG)'].iloc[-8] if len(recent) >= 8 else 0
            row['Gross Amount'] = recent['Gross Amount'].iloc[-1] if not recent.empty else 0
            row['Price Per KG'] = recent['Price Per KG'].iloc[-1] if not recent.empty else 0

            forecast_rows.append(row)

        df_forecast = pd.DataFrame(forecast_rows)
        df_forecast['Predicted Quantity (KG)'] = (np.expm1(model_xgb.predict(df_forecast[features].astype(np.float32))) +
                                                  np.expm1(model_lgb.predict(df_forecast[features].astype(np.float32)))) / 2
        df_forecast['Rice Type'] = rice
        df_forecast['Predicted Quantity (KG)'] = df_forecast['Predicted Quantity (KG)'].clip(lower=0)

        # Save 30-day forecast
        forecast_collection.delete_many({'Rice Type': rice})
        forecast_docs = df_forecast[['Date', 'Rice Type', 'Predicted Quantity (KG)']].copy()
        forecast_docs['Date'] = forecast_docs['Date'].dt.strftime('%Y-%m-%d')
        forecast_docs['Predicted Quantity (KG)'] = forecast_docs['Predicted Quantity (KG)'].round(2)
        forecast_collection.insert_many(forecast_docs.to_dict(orient='records'))

    # ✅ Save full model performance with timestamp
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    accuracy_collection.insert_one({
        "model_name": "XGBoost + LightGBM Hybrid",
        "training_date": now,
        "forecast_horizon_days": 90,
        "total_rice_types_modeled": len(rice_types),
        "total_records_used": len(df_all),
        "date_range": {
            "start": df_all["Date"].min().strftime("%Y-%m-%d"),
            "end": df_all["Date"].max().strftime("%Y-%m-%d"),
        },
        "per_rice_type_metrics": [
            {
                "rice_type": r["Rice Type"],
                "mae": round(r["MAE (KG)"], 2),
                "r2_score": round(r["R² Score"], 4)
            } for r in results
        ],
    })

    return "✅ Forecasting complete"
