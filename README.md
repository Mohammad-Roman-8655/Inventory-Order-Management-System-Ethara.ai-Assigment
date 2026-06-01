# 🚀 Production-Ready Inventory & Order Management System

A modern, containerized full-stack application built for tracking products, customer registrations, multi-product ordering, and real-time inventory management.

---

## 🎨 Technology Stack
- **Frontend:** React, Vite, Axios, Lucide Icons, Vanilla CSS (Premium dark mode, glassmorphism design system)
- **Backend:** Python, FastAPI, SQLAlchemy ORM, Pydantic v2 validations
- **Database:** PostgreSQL 15
- **Containerization:** Docker & Docker Compose

---

## 🏗️ Project Architecture
```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # App routing, CORS & dashboard aggregates
│   │   ├── database.py          # SQLAlchemy Session setup
│   │   ├── models.py            # PostgreSQL schema definitions
│   │   ├── schemas.py           # Pydantic validation models
│   │   └── routers/             # Products, Customers & Orders CRUD
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main tab controller
│   │   ├── index.css            # Custom CSS Glassmorphism design tokens
│   │   ├── api/client.js        # Axios network abstraction
│   │   ├── components/          # Reusable Navbar, Modals & Toast alerts
│   │   └── pages/               # Dashboard, Products, Customers & Orders pages
│   ├── nginx.conf               # SPA routing configurations
│   └── Dockerfile
└── docker-compose.yml           # Multi-container orchestration
```

---

## 🚀 How to Run Locally with Docker Compose

Ensure you have **Docker Desktop** installed and running on your system.

1. **Clone this repository** (or run directly from directory):
   ```bash
   cd inventory-system
   ```

2. **Initialize Environment Variables**:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. **Start the containers**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - **Frontend UI:** `http://localhost:3000`
   - **FastAPI API Swagger Docs:** `http://localhost:8000/docs`
   - **Backend API Base:** `http://localhost:8000`

---

## 📂 Business Logic Rules Implemented

1. **SKU Uniqueness:** All products must have a unique SKU. Database returns HTTP `409 Conflict` on duplicate code creation.
2. **Email Uniqueness:** All customer records must contain a unique email address.
3. **Inventory Constraints:** Product quantity cannot be negative.
4. **Order Stock Control:** Orders cannot exceed current warehouse stock. If inventory is insufficient, the system returns a `400 Bad Request` with exact details of the stock deficit.
5. **Auto Stock Deduction:** Creating an order automatically decrements the stock quantity of each product item in a single database transaction.
6. **Billing Auto-Calculation:** Backend automatically calculates the total invoice price based on the product unit price and quantity ordered.
7. **Order Restorations:** Deleting/Cancelling an order automatically restores the corresponding product quantities back to the stock inventory.

---

## 🐳 How to Build & Push to Docker Hub

1. **Log in to Docker Hub**:
   ```bash
   docker login -u YOUR_DOCKERHUB_USERNAME
   ```

2. **Build the Backend Image**:
   ```bash
   docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend
   ```

3. **Push to Docker Hub**:
   ```bash
   docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
   ```

---

## 🌐 Production Deployment Guide

### 1. Backend Deployment (Render - Free Tier)
1. Sign up on [Render](https://render.com) using your GitHub account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Select **Docker** as the Runtime.
5. In **Advanced Settings**, add the environment variables:
   - `DATABASE_URL`: Your PostgreSQL database URL (Render provides free PostgreSQL databases).
6. Click **Deploy Web Service**.

### 2. Frontend Deployment (Vercel)
1. Sign up on [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. Set Framework Preset to **Vite**.
6. Under **Environment Variables**, add:
   - `VITE_API_URL`: (Your live backend API URL deployed in the step above).
7. Click **Deploy**.
