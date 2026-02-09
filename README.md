# Farm-to-Direct Marketplace

A full-stack MERN application connecting farmers directly with consumers, eliminating middlemen and enabling transparent pricing.

## 🚀 Features

- **Dual User Roles**: Separate dashboards for Farmers and Buyers
- **Product Management**: Farmers can add, edit, and delete their products
- **Shopping Cart**: Buyers can browse, add to cart, and place orders
- **Bulk Order Requests**: Unique negotiation system for large quantity purchases
- **Authentication**: Secure JWT-based authentication
- **Search & Filter**: Find products by category, location, and keywords

## 🛠️ Tech Stack

### Frontend

- React.js
- React Router
- Axios
- Context API (State Management)

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

4. Update `.env` with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farm-marketplace
JWT_SECRET=your_secret_key_here
```

5. Start the server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
P3-/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context
│   │   └── services/    # API services
│   └── public/
└── README.md
```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Products

- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Farmer only)
- `PUT /api/products/:id` - Update product (Farmer only)
- `DELETE /api/products/:id` - Delete product (Farmer only)

### Orders

- `POST /api/orders` - Create order (Buyer only)
- `GET /api/orders/buyer` - Get buyer's orders
- `GET /api/orders/farmer` - Get farmer's orders
- `PUT /api/orders/:id/status` - Update order status

### Bulk Requests

- `POST /api/bulk-requests` - Create bulk request (Buyer only)
- `GET /api/bulk-requests/farmer` - Get farmer's bulk requests
- `GET /api/bulk-requests/buyer` - Get buyer's bulk requests
- `PUT /api/bulk-requests/:id/respond` - Respond to bulk request (Farmer only)

## 👥 User Roles

### Farmer

- Add new products with images
- Manage inventory (edit/delete products)
- View incoming orders
- Respond to bulk order requests with custom pricing

### Buyer

- Browse product catalog
- Search and filter products
- Add items to cart
- Place orders
- Request bulk orders for negotiation
- View order history

## 🎯 Standout Feature: Bulk Order Negotiation

This feature demonstrates domain understanding of agricultural markets where bulk purchases often involve price negotiation. Buyers can request quotes for large quantities, and farmers can respond with custom pricing.

## 🚀 Deployment

### Backend (Render/Railway)

1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add environment variable: `REACT_APP_API_URL`

## 📝 License

ISC

## 👨‍💻 Author

Built for internship portfolio demonstration
