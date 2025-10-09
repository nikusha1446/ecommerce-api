# E-Commerce API

A full-featured RESTful API for an e-commerce platform built with Node.js, Express, Prisma, and PostgreSQL. Includes JWT authentication, shopping cart, and Stripe payment integration.

---

## ✨ Features

- **Authentication** - JWT-based user authentication with role-based access control
- **Product Management** - Full CRUD operations for products (admin only)
- **Categories** - Organize products by categories
- **Shopping Cart** - Add, update, and remove items from cart
- **Payment Integration** - Secure checkout with Stripe
- **Order Management** - Track orders and order history
- **Role-Based Access** - Separate permissions for users and admins

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Payment:** Stripe

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**
- **Stripe Account** (for payment testing)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nikusha1446/ecommerce-api.git
cd ecommerce-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="your-secret-jwt-key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
PORT=3000
```

**Get your Stripe keys:**
1. Sign up at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy your **Secret key** (starts with `sk_test_`)

### 4. Set up the database

```bash
# Run Prisma migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

### 5. Start the server

```bash
npm run dev
```

Server will be running at `http://localhost:3000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

---

### 🔐 Authentication

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Use the token in subsequent requests:**
```http
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 🏷️ Categories

#### Get All Categories
```http
GET /categories
```

#### Create Category (Admin Only)
```http
POST /categories
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and gadgets"
}
```

---

### 📦 Products

#### Get All Products
```http
GET /products
```

#### Get Product by ID
```http
GET /products/:id
```

#### Create Product (Admin Only)
```http
POST /products
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "MacBook Pro M2",
  "description": "High-performance laptop",
  "price": 1299.99,
  "stock": 25,
  "imageUrl": "/images/laptop.jpg",
  "categoryId": "category-id-here"
}
```

#### Update Product (Admin Only)
```http
PUT /products/:id
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "price": 1199.99,
  "stock": 30
}
```

#### Delete Product (Admin Only)
```http
DELETE /products/:id
Authorization: Bearer ADMIN_TOKEN
```

---

### 🛍️ Shopping Cart

#### Add Item to Cart
```http
POST /cart/items
Authorization: Bearer USER_TOKEN
Content-Type: application/json

{
  "productId": "product-id-here",
  "quantity": 2
}
```

#### Get Cart
```http
GET /cart/items
Authorization: Bearer USER_TOKEN
```

#### Update Cart Item
```http
PUT /cart/items/:id
Authorization: Bearer USER_TOKEN
Content-Type: application/json

{
  "quantity": 5
}
```

#### Remove Cart Item
```http
DELETE /cart/items/:id
Authorization: Bearer USER_TOKEN
```

---

### 💳 Orders & Payment

#### Create Checkout Session
```http
POST /orders/checkout
Authorization: Bearer USER_TOKEN
```

#### Simulate payment
```http
POST /orders/simulate-payment
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx"
}
```

#### Confirm Payment
```http
POST /orders/confirm
Authorization: Bearer USER_TOKEN
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx"
}
```

#### Get My Orders
```http
GET /orders
Authorization: Bearer USER_TOKEN
```

#### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer USER_TOKEN
```

---

## 🗄️ Database Schema

### Models

- **User** - User accounts with roles (USER/ADMIN)
- **Category** - Product categories
- **Product** - Products with pricing and stock
- **Cart** - Shopping carts (one per user)
- **CartItem** - Items in cart
- **Order** - Completed orders
- **OrderItem** - Items in an order (with price snapshot)

### Relationships

```
User 1──1 Cart
User 1──* Order

Cart 1──* CartItem
CartItem *──1 Product

Order 1──* OrderItem
OrderItem *──1 Product

Category 1──* Product
```

---

## 🔒 Authentication & Authorization

### Roles

- **USER** - Regular customer
  - Can view products
  - Can manage their own cart
  - Can place orders
  - Can view their own orders

- **ADMIN** - Administrator
  - All USER permissions
  - Can create/update/delete products
  - Can create categories
  - Can view all orders

### Creating an Admin User

1. Sign up normally
2. Open Prisma Studio: `npm run prisma:studio`
3. Go to the `users` table
4. Find your user and change `role` from `USER` to `ADMIN`

---

## 📄 License

This project is open source and available under the ISC license
