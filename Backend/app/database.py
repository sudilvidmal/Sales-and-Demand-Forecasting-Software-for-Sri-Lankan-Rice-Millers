from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb+srv://punsarithvidmal:V4iqoY1DK7TeoAmH@salesforecastcluster.clqcmca.mongodb.net/?retryWrites=true&w=majority&appName=SalesForecastCluster"

client = AsyncIOMotorClient(MONGO_URI)
database = client["UserManagementDB"]  # This DB name will be auto-created
user_collection = database.get_collection("users")  # This collection too
admin_collection = database.get_collection("admins")
inventory_collection = database.get_collection("inventory")
forecast_collection = database.get_collection("rice_forecasts")  # ✅ if not already there
test_upload_data_collection = database.get_collection("test_upload_data")
system_logs_collection = database.get_collection("system_logs")
