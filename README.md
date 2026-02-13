# 🌾 AgriConnect - Farm-to-Direct Marketplace

A full-stack MERN application connecting farmers directly with buyers, eliminating middlemen and enabling transparent pricing. Built with modern web technologies and deployed to production.

[![Backend](https://img.shields.io/badge/Backend-Live%20on%20Render-success)](https://agriconnect-backend-3jfy.onrender.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)](https://www.mongodb.com/cloud/atlas)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## 🚀 Live Demo

- **Backend API**: [https://agriconnect-backend-3jfy.onrender.com](https://agriconnect-backend-3jfy.onrender.com)
- **Frontend**: Deploy to Netlify/Vercel (instructions below)
- **Database**: MongoDB Atlas (Cloud)

## ✨ Features

### For Farmers 🚜

- ✅ Add, edit, and delete products with pricing
- ✅ Manage inventory and stock levels
- ✅ View and manage incoming orders
- ✅ Respond to bulk order requests with custom pricing
- ✅ Track sales and order history

### For Buyers 🛒

- ✅ Browse fresh produce from local farmers
- ✅ Search and filter products by category, location
- ✅ Add items to shopping cart
- ✅ Place orders directly with farmers
- ✅ Request bulk orders for negotiation
- ✅ View order history and status

### Core Features 🎯

- ✅ **Dual User Roles**: Separate dashboards for Farmers and Buyers
- ✅ **Secure Authentication**: JWT-based login/register system
- ✅ **Shopping Cart**: Full cart management with checkout
- ✅ **Bulk Order Negotiation**: Unique feature for agricultural markets
- ✅ **Real-time Updates**: Order status tracking
- ✅ **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

### Frontend

- **React 18.2** - Modern UI library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Context API** - State management (Auth, Cart)
- **CSS3** - Custom styling with modern design

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Deployment

- **Backend**: Render (Free tier)
- **Frontend**: Netlify/Vercel (Free tier)
- **Database**: MongoDB Atlas (Free 512MB cluster)

## 📦 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local) or MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/gb112302/agriconnect.git
cd agriconnect
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
# Required variables:
# - PORT=5000
# - MONGODB_URI=your_mongodb_connection_string
# - JWT_SECRET=your_secret_key
# - NODE_ENV=development

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file (already configured for local development)
# REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

Frontend will open at `http://localhost:3000`

## 📁 Project Structure

```
agriconnect/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema (Farmer/Buyer)
│   │   ├── Product.js        # Product schema
│   │   ├── Order.js          # Order schema
│   │   └── BulkRequest.js    # Bulk order request schema
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── products.js       # Product CRUD routes
│   │   ├── orders.js         # Order management routes
│   │   └── bulkRequests.js   # Bulk request routes
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── server.js             # Express server setup
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js     # Navigation component
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Authentication state
│   │   │   └── CartContext.js    # Shopping cart state
│   │   ├── pages/
│   │   │   ├── Home.js           # Landing page
│   │   │   ├── Login.js          # Login page
│   │   │   ├── Register.js       # Registration page
│   │   │   ├── Dashboard.js      # User dashboard
│   │   │   ├── Products.js       # Product listing
│   │   │   └── Cart.js           # Shopping cart
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   ├── App.js                # Main app component
│   │   ├── App.css               # App styles
│   │   ├── index.js              # React entry point
│   │   └── index.css             # Global styles
│   ├── package.json
│   ├── vercel.json               # Vercel config
│   └── .env
│
├── render.yaml                   # Render deployment config
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # This file
```

## 🔑 API Endpoints

### Authentication

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register` | Register new user | No            |
| POST   | `/api/auth/login`    | Login user        | No            |
| GET    | `/api/auth/profile`  | Get user profile  | Yes           |

### Products

| Method | Endpoint            | Description        | Auth Required | Role   |
| ------ | ------------------- | ------------------ | ------------- | ------ |
| GET    | `/api/products`     | Get all products   | Yes           | Any    |
| GET    | `/api/products/:id` | Get single product | Yes           | Any    |
| POST   | `/api/products`     | Create product     | Yes           | Farmer |
| PUT    | `/api/products/:id` | Update product     | Yes           | Farmer |
| DELETE | `/api/products/:id` | Delete product     | Yes           | Farmer |

### Orders

| Method | Endpoint                 | Description         | Auth Required | Role   |
| ------ | ------------------------ | ------------------- | ------------- | ------ |
| POST   | `/api/orders`            | Create order        | Yes           | Buyer  |
| GET    | `/api/orders`            | Get user's orders   | Yes           | Any    |
| GET    | `/api/orders/:id`        | Get single order    | Yes           | Any    |
| PUT    | `/api/orders/:id/status` | Update order status | Yes           | Farmer |

### Bulk Requests

| Method | Endpoint                         | Description         | Auth Required | Role   |
| ------ | -------------------------------- | ------------------- | ------------- | ------ |
| POST   | `/api/bulk-requests`             | Create bulk request | Yes           | Buyer  |
| GET    | `/api/bulk-requests`             | Get bulk requests   | Yes           | Any    |
| GET    | `/api/bulk-requests/:id`         | Get single request  | Yes           | Any    |
| POST   | `/api/bulk-requests/:id/respond` | Respond to request  | Yes           | Farmer |

## 🚀 Deployment

### Backend Deployment (Render)

**Status**: ✅ Already deployed!

Backend is live at: `https://agriconnect-backend-3jfy.onrender.com`

To redeploy or update:

1. Push changes to GitHub
2. Render auto-deploys from `main` branch
3. Check deployment logs in Render dashboard

### Frontend Deployment (Netlify - Recommended)

1. **Go to Netlify**: https://app.netlify.com
2. **Import project**: Click "Add new site" → "Import an existing project"
3. **Select repository**: `gb112302/agriconnect`
4. **Configure build settings**:
   ```
   Root Directory: frontend
   Build command: npm run build
   Publish directory: build
   ```
5. **Add environment variable**:
   ```
   REACT_APP_API_URL=https://agriconnect-backend-3jfy.onrender.com/api
   ```
6. **Deploy!**

### Frontend Deployment (Vercel - Alternative)

1. **Go to Vercel**: https://vercel.com
2. **Import project** from GitHub
3. **IMPORTANT**: Set Root Directory to `frontend` in Settings → General
4. **Add environment variable**: `REACT_APP_API_URL`
5. **Deploy**

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl https://agriconnect-backend-3jfy.onrender.com/api/health

# Register user
curl -X POST https://agriconnect-backend-3jfy.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"buyer"}'
```

### Test Frontend Locally

```bash
cd frontend
npm start
# Visit http://localhost:3000
# Test registration, login, products, cart
```

## 👥 User Roles & Permissions

### Farmer

- Can create, edit, delete their own products
- Can view and manage orders for their products
- Can respond to bulk order requests
- Cannot add items to cart or place orders

### Buyer

- Can browse all products
- Can add products to cart and checkout
- Can place orders
- Can create bulk order requests
- Cannot create or manage products

## 🎯 Standout Feature: Bulk Order Negotiation

This feature demonstrates understanding of agricultural markets where bulk purchases often involve price negotiation:

1. **Buyer** creates a bulk request specifying product, quantity, and desired price
2. **Farmers** receive notifications of bulk requests
3. **Farmers** can respond with custom pricing and availability
4. **Buyer** reviews responses and selects best offer
5. **Order** is created based on negotiated terms

This feature sets AgriConnect apart from generic e-commerce platforms.

## 🔒 Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Protected API routes with middleware
- ✅ CORS configuration for production
- ✅ Environment variable protection
- ✅ Input validation on all forms
- ✅ Role-based access control

## 🌐 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agriconnect
JWT_SECRET=your_super_secret_jwt_key_change_in_production
USE_LOCAL_DB=false
FRONTEND_URL=https://your-frontend-url.netlify.app
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Frontend (.env.production)

```env
REACT_APP_API_URL=https://agriconnect-backend-3jfy.onrender.com/api
```

## 📈 Future Enhancements

- [ ] Image upload for products (Cloudinary integration)
- [ ] Real-time chat between farmers and buyers
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Order tracking with status updates
- [ ] Rating and review system
- [ ] Mobile app (React Native)
- [ ] Admin dashboard for platform management
- [ ] Analytics for farmers (sales reports, trends)
- [ ] Email notifications for orders
- [ ] Multi-language support

## 🐛 Troubleshooting

### Backend Issues

**MongoDB connection failed**

- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
- Verify connection string in `.env`
- Ensure database user has correct permissions

**CORS errors**

- Add frontend URL to CORS whitelist in `server.js`
- Check `FRONTEND_URL` environment variable in Render

### Frontend Issues

**API calls failing**

- Verify `REACT_APP_API_URL` is set correctly
- Check backend is running and accessible
- Open browser console (F12) for error details

**Blank page after deployment**

- Check browser console for errors
- Verify build completed successfully
- Ensure Root Directory is set to `frontend` (Netlify/Vercel)

## 📝 License

ISC

## 👨‍💻 Author

**Your Name**

- GitHub: [@gb112302](https://github.com/gb112302)
- Project: AgriConnect Farm Marketplace

Built as a full-stack portfolio project demonstrating:

- Modern web development practices
- RESTful API design
- React state management
- Cloud deployment
- Production-ready code

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Render for backend hosting
- Netlify/Vercel for frontend hosting
- React community for excellent documentation

---

**⭐ Star this repo if you found it helpful!**

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
