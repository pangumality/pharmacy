# hello260 API

Backend API for the hello260 e-commerce platform.

## Setup

1. **Install Dependencies**

```bash
cd api
npm install
```

2. **Environment Variables**

Create a `.env` file in the api directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hello260
JWT_SECRET=your-secret-key-here
NODE_ENV=development

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=hello260 <noreply@example.com>
```

## Usage

### Development Server

```bash
npm run dev
```

The server will run on http://localhost:5000 (or the PORT specified in your .env file).

### Database Seeding

To seed the database with initial users and products:

```bash
npm run seed
```

To clear all data from the database:

```bash
npm run seed:destroy
```

## API Endpoints

### Products

- `GET /api/products` - Get all products (paginated)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### Users

- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

### Orders

- `POST /api/orders` - Create a new order (authenticated)
- `GET /api/orders/myorders` - Get user's orders (authenticated)
- `GET /api/orders/:id` - Get order details (authenticated)
- `PUT /api/orders/:id/pay` - Update order to paid (authenticated)
- `PUT /api/orders/:id/deliver` - Update order to delivered (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `GET /api/orders` - Get all orders (admin only)

## Authentication

The API uses JWT for authentication. For protected routes, include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```
