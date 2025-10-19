# Sure Findings E-commerce Backend

This is the backend API for the Sure Findings e-commerce application, built with Node.js, Express, and MongoDB.

## Features

- User authentication (registration, login, profile management)
- Product management (CRUD operations)
- Shopping cart functionality
- Wishlist management
- Order processing
- Category management
- Address and payment method management

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- Bcrypt for password hashing
- Dotenv for environment variable management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search` - Search products

### Cart
- `GET /api/cart` - Get user's cart (authenticated)
- `POST /api/cart` - Add item to cart (authenticated)
- `PUT /api/cart/:itemId` - Update cart item quantity (authenticated)
- `DELETE /api/cart/:itemId` - Remove item from cart (authenticated)
- `DELETE /api/cart` - Clear cart (authenticated)

### Wishlist
- `GET /api/wishlist` - Get user's wishlist (authenticated)
- `POST /api/wishlist` - Add item to wishlist (authenticated)
- `DELETE /api/wishlist/:itemId` - Remove item from wishlist (authenticated)
- `GET /api/wishlist/check/:productId` - Check if product is in wishlist (authenticated)

### Orders
- `POST /api/orders` - Create new order (authenticated)
- `GET /api/orders` - Get user's orders (authenticated)
- `GET /api/orders/:orderId` - Get order by ID (authenticated)

## Setup Instructions

1. Install MongoDB locally or use a MongoDB Atlas cluster
2. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=24h
   BCRYPT_SALT_ROUNDS=10
   ```
3. Install dependencies: `npm install`
4. Start the server: `npm run backend`

## Development

To run both frontend and backend concurrently:
```
npm run dev
```

This will start the React frontend on port 3000 and the Express backend on port 5000.