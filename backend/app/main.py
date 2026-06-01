from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import products, customers, orders
from .models import Product, Customer, Order, OrderItem
from sqlalchemy.orm import Session
from .database import SessionLocal
from .schemas import DashboardStats
from .models import Product as ProductModel

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management API",
    description="A production-ready API for managing products, customers, and orders.",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Inventory & Order Management API is running"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


@app.get("/dashboard", response_model=DashboardStats, tags=["Dashboard"])
def get_dashboard():
    db: Session = SessionLocal()
    try:
        total_products = db.query(ProductModel).count()
        total_customers = db.query(Customer).count()
        total_orders = db.query(Order).count()
        low_stock = db.query(ProductModel).filter(ProductModel.quantity <= 5).all()
        return DashboardStats(
            total_products=total_products,
            total_customers=total_customers,
            total_orders=total_orders,
            low_stock_products=low_stock,
        )
    finally:
        db.close()
