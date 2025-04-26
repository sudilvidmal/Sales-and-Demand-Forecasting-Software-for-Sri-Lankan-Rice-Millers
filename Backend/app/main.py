from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ✅ Import all your route modules
from app.routes import (
    user_routes,
    admin_routes,
    upload_routes,
    forecast_routes,
    searchdata_routes,
    report_routes,
    inventory_routes,
    inventory_analysis_routes,
    chatbot_routes,
    forgot_password_routes,          # ✅ User Forgot Password
    admin_forgot_password_routes,    # ✅ Admin Forgot Password
    forecast_model_routes,
    admin_forecast_page_routes,
    admin_dashboard_routes,
    admin_inventory_routes,
    admin_sales_page_routes,
    user_section_sales_routes,
    user_section_dashboard_routes,
    user_section_demand_routes,
    notification_routes,
)

# ✅ Initialize the app
app = FastAPI()

# ✅ Setup CORS Middleware (React Frontend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust this if you deploy online
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Mount Static Files (for profile pictures, uploads, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Include Basic Routes
app.include_router(user_routes.router)
app.include_router(admin_routes.router)
app.include_router(upload_routes.router)
app.include_router(forecast_routes.router)
app.include_router(searchdata_routes.router)
app.include_router(report_routes.router)
app.include_router(inventory_routes.router)
app.include_router(inventory_analysis_routes.router)
app.include_router(chatbot_routes.router)

# ✅ Include Forgot Password Routes
app.include_router(forgot_password_routes.router)            # User side Forgot Password
app.include_router(admin_forgot_password_routes.router)      # Admin side Forgot Password

# ✅ Include Feature-Based Routes with Prefix and Tags
app.include_router(forecast_model_routes.router, prefix="/forecast", tags=["Forecast"])
app.include_router(admin_forecast_page_routes.router, prefix="/admin-forecast", tags=["Admin Forecast"])
app.include_router(admin_dashboard_routes.router, prefix="/admin-dashboard", tags=["Admin Dashboard"])
app.include_router(admin_inventory_routes.router, prefix="/admin/inventory", tags=["Admin Inventory"])
app.include_router(admin_sales_page_routes.router, prefix="/admin/sales", tags=["Admin Sales"])
app.include_router(user_section_sales_routes.router, prefix="/user", tags=["User Sales"])
app.include_router(user_section_dashboard_routes.router, prefix="/user/dashboard", tags=["User Dashboard"])
app.include_router(user_section_demand_routes.router, prefix="/user/demand", tags=["User Demand"])
app.include_router(notification_routes.router, prefix="/notifications", tags=["Notifications"])
