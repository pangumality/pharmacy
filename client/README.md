# hello260

hello260 is a full-stack e-commerce application built with React and Node.js. It provides a modern online shopping experience for plants and gardening products, with features for both customers and administrators.

## Features

### Customer Features
- Browse and search products with filtering options
- View detailed product information and related products
- User authentication (login/registration) 
- Shopping cart functionality
- Checkout process with shipping and payment options
- Order history and tracking
- User profile management

### Admin Features
- Product management (add, edit, delete products)
- Order management (view, update status)
- Customer management
- Dashboard with analytics

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS with shadcn/ui components
- React Router for navigation
- React Hook Form for form management
- Context API for state management

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Mongoose for database modeling

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```sh
git clone https://github.com/pangumality/hello260.git
cd hello260
```

2. Install frontend dependencies
```sh
npm install
```

3. Install backend dependencies
```sh
cd api
npm install
```

4. Create a `.env` file in the root of the backend directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

5. Create a `.env` file in the root of the frontend directory:
```
VITE_API_URL=http://localhost:4000/api
```

### Running the application

1. Start the backend server
```sh
cd api
npm run dev
```

2. In a new terminal, start the frontend development server
```sh
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## API Structure

The backend API is organized around the following main resources:

- `/api/users` - User authentication and profile management
- `/api/products` - Product CRUD operations
- `/api/orders` - Order creation and management
- `/api/uploads` - File uploads (for product images)

## License
