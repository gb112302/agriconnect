# AgriConnect Backend

Backend API for AgriConnect Farm-to-Direct Marketplace

## Deployment on Render

This backend is configured for deployment on Render.com

### Environment Variables Required

- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT tokens (minimum 32 characters)
- `NODE_ENV`: Set to "production"
- `FRONTEND_URL`: https://agriconnectgb.netlify.app
- `PORT`: 5000 (Render will override this)

### Build Command

```
npm install
```

### Start Command

```
node server.js
```

## Local Development

```bash
npm install
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - Get all products
- And more...

## Features

- ✅ User authentication with JWT
- ✅ Role-based access control (Buyer/Farmer/Admin)
- ✅ Product management
- ✅ Order processing
- ✅ Reviews and ratings
- ✅ Analytics dashboard
- ✅ Multi-language support
