# Mithila Makhana - Authentic Makhana from Bihar

> **"Authentic Bihar. Premium Makhana. From our family to yours."**

A complete, modern, production-ready full-stack e-commerce platform built for **Mithila Makhana**, a family-owned makhana (fox nuts / lotus seeds) business rooted in Bihar, India.

---

## 🌾 Highlights & Features

- **Brand & Visual Aesthetic:**
  - Warm cream, natural earthy brown, roasted makhana gold, and natural dark green palette.
  - Authentic typography paired with Cormorant Garamond and Plus Jakarta Sans.
  - Subtle Framer Motion animations and responsive cards.
- **Authentic Sourced Photography:**
  - Uses original user-uploaded product and heritage photos across hero, story, products, and recipes.
  - Centralized image mapping in `src/utils/imageMap.js` (frontend) and `src/utils/imageMap.js` (backend) for easy future replacement.
- **Frontend Architecture:**
  - React 18 with Vite
  - Tailwind CSS with bespoke Mithila brand tokens
  - React Router v6 with clean URLs and slugs
  - Axios API client with automatic JWT token attachment
  - Context State: `CartContext` (persisted in localStorage), `AuthContext`, `WishlistContext`, and `ToastContext`
- **Backend & Database:**
  - Node.js & Express REST API
  - Dual Persistence Architecture: Connects seamlessly to MongoDB via Mongoose when configured, and automatically operates in file-backed persistence mode (`backend/data/`) if MongoDB is not running locally — zero configuration required to run immediately!
  - JWT Authentication & bcrypt password hashing
  - Role-based authorization (`customer` vs `admin`)
- **Checkout & Payment:**
  - Complete multi-step checkout (Contact info, full Indian shipping address with PIN code, order summary)
  - Razorpay integration architecture with public Key ID configuration and backend cryptographic signature verification
  - Seamless Test / Demo checkout mode and Cash on Delivery (COD) support
- **Order Tracking:**
  - Visual 7-step progression timeline:
    `Order Placed` ➔ `Confirmed` ➔ `Processing` ➔ `Packed` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`
  - Order search and tracking by Order Reference ID
- **Admin Dashboard (`/admin`):**
  - Protected with admin authentication
  - Live revenue, order count, registered users, and product metrics
  - Product CRUD (Name, category, price, compare price, weights, nutrition facts, images, stock)
  - Order Management: Search, filter by status, and update order status through all 7 stages
  - Recipe Management: Create, edit, and delete culinary recipes
  - Customer Inquiry inbox from contact page
- **Cultural & Educational Content:**
  - "From the Waterlands of Bihar to Your Home" heritage story
  - "Why Makhana" educational breakdown of wetland cultivation and gentle popping
  - Health & nutrition information with responsible claims ("can be part of a balanced diet")
  - Traditional and contemporary recipes (Roasted Masala Makhana, Makhana Kheer, Chaat, Caramel Makhana)

---

## 📁 Project Structure

```
mithila-makhana/
│
├── frontend/
│   ├── public/
│   │   └── images/                # Uploaded product & heritage photography
│   ├── src/
│   │   ├── components/            # Navbar, Footer, ProductCard, OrderTimeline, SearchModal
│   │   ├── context/               # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── pages/                 # Home, Shop, ProductDetail, About, WhyMakhana, Recipes,
│   │   │                          # Cart, Checkout, OrderConfirmation, TrackOrder, Wishlist,
│   │   │                          # Login, Register, Profile, AdminDashboard
│   │   ├── services/              # Axios API service
│   │   ├── utils/                 # imageMap.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── public/
│   │   └── uploads/               # Static image serving
│   ├── src/
│   │   ├── config/                # Database connection & store initialization
│   │   ├── controllers/           # Auth, Product, Order, Payment, Recipe, Contact, Admin
│   │   ├── middleware/            # Auth, admin, error handlers
│   │   ├── models/                # User, Product, Order, Recipe, Contact
│   │   ├── routes/                # REST API routes
│   │   ├── services/              # Store persistence provider
│   │   ├── utils/                 # JWT helper, seed script, imageMap.js
│   │   ├── app.js
│   │   └── server.js
│   ├── data/                      # Local JSON persistence storage
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or v20+)
- npm (comes with Node.js)
- *(Optional)* [MongoDB](https://www.mongodb.com/) (The backend automatically falls back to robust local file-backed persistence in `backend/data/` if MongoDB is not running locally).

### 1. Backend Setup

```bash
cd backend

# Install dependencies (already installed in this environment)
npm install

# (Optional) Seed or re-seed sample products, recipes, and users
node src/utils/seedData.js

# Start backend server (starts on http://localhost:5000)
npm start
# or for development:
npm run dev
```

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend

# Install dependencies (already installed in this environment)
npm install

# Start Vite development server (starts on http://localhost:5173)
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Demo & Test Accounts

For testing both customer and administrative functions, pre-seeded accounts with 1-click autofill buttons are available on the login page:

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@mithilamakhana.com` | `admin123` | Full Admin Dashboard, Product CRUD, Order Status Management, Recipes, Inquiries |
| **Customer** | `customer@mithilamakhana.com` | `customer123` | Shopping, Checkout, Order Tracking, Saved Addresses, Wishlist |

---

## 💳 Payment Architecture & Razorpay Configuration

The application is architected for **Razorpay**:
- Public configuration endpoint: `GET /api/payments/config` (never exposes secret keys).
- Order creation: `POST /api/payments/create-order`
- Cryptographic verification: `POST /api/payments/verify` (HMAC SHA256)
- **Demo Mode**: Active by default. You can test complete checkouts, order confirmations, and status timelines without entering live bank credentials.
- To use your live Razorpay credentials, configure `backend/.env`:
  ```env
  RAZORPAY_KEY_ID=your_razorpay_key_id
  RAZORPAY_KEY_SECRET=your_razorpay_key_secret
  ```

---

## 📡 REST API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/products` | Get products (supports `?category=`, `?sort=`, `?search=`, `?featured=`) |
| `GET` | `/api/products/:slugOrId` | Product detail with related items and reviews |
| `POST` | `/api/products` | Create product (Admin) |
| `PUT` | `/api/products/:id` | Update product (Admin) |
| `DELETE` | `/api/products/:id` | Delete product (Admin) |
| `POST` | `/api/products/:id/reviews` | Add customer review |
| `POST` | `/api/auth/register` | Register new customer |
| `POST` | `/api/auth/login` | Login user & receive JWT |
| `GET` | `/api/auth/profile` | Logged-in profile & saved addresses |
| `POST` | `/api/orders` | Place order |
| `GET` | `/api/orders/my-orders` | Customer order history |
| `GET` | `/api/orders/:orderId` | Track order by reference ID |
| `GET` | `/api/orders` | List all orders (Admin) |
| `PUT` | `/api/orders/:orderId/status` | Update order progression stage (Admin) |
| `GET` | `/api/admin/stats` | Business metrics and sales revenue (Admin) |
| `GET` | `/api/recipes` | List recipes |
| `POST` | `/api/contact` | Submit customer contact inquiry |
