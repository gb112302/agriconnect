# AgriConnect Deployment Guide

Complete step-by-step guide to deploy the AgriConnect Farm-to-Direct Marketplace application to production.

---

## Prerequisites

Before starting, create accounts on:

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Database)
- [Render](https://render.com/) (Backend hosting)
- [Vercel](https://vercel.com/) (Frontend hosting)
- [GitHub](https://github.com/) (Code repository - already set up)

---

## Phase 1: MongoDB Atlas Setup (10 minutes)

### Step 1: Create MongoDB Atlas Cluster

1. **Sign up/Login** to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a New Project**
   - Click "New Project"
   - Name: `AgriConnect`
   - Click "Create Project"

3. **Build a Database**
   - Click "Build a Database"
   - Choose **FREE** tier (M0 Sandbox)
   - Provider: AWS
   - Region: Choose closest to you
   - Cluster Name: `Cluster0` (default)
   - Click "Create"

### Step 2: Configure Database Access

1. **Create Database User**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Authentication Method: Password
   - Username: `agriconnect-admin`
   - Password: Click "Autogenerate Secure Password" (SAVE THIS!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

2. **Configure Network Access**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Render deployment)
   - IP Address: `0.0.0.0/0`
   - Click "Confirm"

### Step 3: Get Connection String

1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js, Version: 5.5 or later
5. Copy the connection string:
   ```
   mongodb+srv://agriconnect-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name: `agriconnect` after `.net/`
   ```
   mongodb+srv://agriconnect-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agriconnect?retryWrites=true&w=majority
   ```
8. **SAVE THIS CONNECTION STRING** - you'll need it for Render

---

## Phase 2: Backend Deployment to Render (15 minutes)

### Step 1: Prepare Repository

1. **Commit all changes**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

### Step 2: Create Render Web Service

1. **Sign up/Login** to [Render](https://render.com/)

2. **Connect GitHub**
   - Click "New +" → "Web Service"
   - Click "Connect GitHub"
   - Authorize Render to access your repositories
   - Select your `agriconnect` repository

3. **Configure Web Service**
   - Name: `agriconnect-backend`
   - Region: Oregon (US West) or closest to you
   - Branch: `main`
   - Root Directory: Leave empty
   - Runtime: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: **Free**

### Step 3: Set Environment Variables

Click "Advanced" → "Add Environment Variable" and add:

| Key            | Value                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `NODE_ENV`     | `production`                                                                                                       |
| `PORT`         | `5000`                                                                                                             |
| `MONGODB_URI`  | `mongodb+srv://agriconnect-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agriconnect?retryWrites=true&w=majority` |
| `JWT_SECRET`   | Generate a random string (use: https://randomkeygen.com/)                                                          |
| `USE_LOCAL_DB` | `false`                                                                                                            |

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Watch the logs for:
   ```
   ✅ MongoDB connected successfully
   🚀 Server running on port 5000
   ```

### Step 5: Test Backend

1. **Copy your Render URL** (e.g., `https://agriconnect-backend.onrender.com`)

2. **Test health endpoint** in browser:

   ```
   https://agriconnect-backend.onrender.com/api/health
   ```

   Expected response:

   ```json
   {
     "status": "OK",
     "message": "Farm Marketplace API is running"
   }
   ```

3. **Save your backend URL** - you'll need it for frontend deployment!

---

## Phase 3: Frontend Deployment to Vercel (10 minutes)

### Step 1: Update Frontend Environment

1. **Update `.env.production`** with your Render URL:

   ```bash
   REACT_APP_API_URL=https://agriconnect-backend.onrender.com/api
   ```

2. **Update backend CORS** in `backend/server.js`:
   - Replace `'https://your-app.vercel.app'` with your actual Vercel URL (you'll get this after deployment)
   - For now, you can deploy and update this later

3. **Commit changes**:
   ```bash
   git add .
   git commit -m "Update production API URL"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Sign up/Login** to [Vercel](https://vercel.com/)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select your `agriconnect` repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Create React App**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add variable:
     - Name: `REACT_APP_API_URL`
     - Value: `https://agriconnect-backend.onrender.com/api` (your Render URL)
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (3-5 minutes)

### Step 3: Update Backend CORS

1. **Copy your Vercel URL** (e.g., `https://agriconnect-abc123.vercel.app`)

2. **Update `backend/server.js`**:

   ```javascript
   const corsOptions = {
     origin:
       process.env.NODE_ENV === "production"
         ? [process.env.FRONTEND_URL, "https://agriconnect-abc123.vercel.app"]
         : ["http://localhost:3000", "http://localhost:3001"],
     credentials: true,
   };
   ```

3. **Add environment variable in Render**:
   - Go to Render dashboard → Your service
   - Environment → Add Environment Variable
   - Key: `FRONTEND_URL`
   - Value: `https://agriconnect-abc123.vercel.app`
   - Save

4. **Commit and push**:

   ```bash
   git add .
   git commit -m "Update CORS for production frontend"
   git push origin main
   ```

5. Render will auto-deploy the changes

---

## Phase 4: Testing & Verification (15 minutes)

### Test Backend

1. **Health Check**

   ```bash
   curl https://agriconnect-backend.onrender.com/api/health
   ```

2. **User Registration**

   ```bash
   curl -X POST https://agriconnect-backend.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Farmer",
       "email": "farmer@test.com",
       "password": "password123",
       "role": "farmer",
       "phone": "1234567890",
       "location": {"state": "Gujarat", "district": "Ahmedabad"}
     }'
   ```

3. **Check MongoDB Atlas**
   - Go to MongoDB Atlas → Database → Browse Collections
   - Verify `users` collection has your test user

### Test Frontend

1. **Open your Vercel URL** in browser

2. **Test Registration**
   - Navigate to `/register`
   - Fill out the form
   - Submit
   - Check browser console for errors

3. **Test Login**
   - Navigate to `/login`
   - Login with registered credentials
   - Verify redirect to dashboard

4. **Test Features**
   - Browse products
   - Add to cart (buyer)
   - Create product (farmer)
   - Check all pages load correctly

### Verify Integration

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Perform actions** (login, view products)
4. **Check API calls**:
   - Should go to your Render backend URL
   - Status codes should be 200/201
   - No CORS errors

---

## Deployment URLs

After successful deployment, save these URLs:

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://agriconnect-backend.onrender.com/api`
- **MongoDB**: MongoDB Atlas Dashboard

---

## Troubleshooting

### Backend Issues

**Problem**: "MongoDB connection failed"

- **Solution**: Check MongoDB Atlas connection string
- Verify username/password are correct
- Ensure IP whitelist includes `0.0.0.0/0`

**Problem**: "Cannot find module"

- **Solution**: Check build command includes `npm install`
- Verify `package.json` is in backend directory

**Problem**: Backend not responding

- **Solution**: Check Render logs for errors
- Verify environment variables are set
- Check if service is running

### Frontend Issues

**Problem**: "Failed to fetch" or CORS errors

- **Solution**: Verify `REACT_APP_API_URL` is correct
- Check backend CORS configuration includes frontend URL
- Ensure backend is running

**Problem**: Blank page

- **Solution**: Check browser console for errors
- Verify build completed successfully
- Check Vercel build logs

**Problem**: Routes not working (404 on refresh)

- **Solution**: Verify `vercel.json` exists with rewrites configuration

### Database Issues

**Problem**: Data not persisting

- **Solution**: Verify `USE_LOCAL_DB=false` in Render
- Check MongoDB Atlas connection is successful
- Look for "In-memory MongoDB" in logs (should NOT appear)

---

## Maintenance

### Updating the Application

1. **Make changes locally**
2. **Test locally**
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
4. **Auto-deploy**: Both Render and Vercel will automatically deploy

### Monitoring

- **Render**: Check logs at https://dashboard.render.com
- **Vercel**: Check deployments at https://vercel.com/dashboard
- **MongoDB**: Monitor at https://cloud.mongodb.com

### Free Tier Limitations

**Render Free Tier:**

- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month (sufficient for one service)

**Vercel Free Tier:**

- 100 GB bandwidth/month
- Unlimited deployments
- No sleep/spin-down

**MongoDB Atlas Free Tier:**

- 512 MB storage
- Shared cluster
- No credit card required

---

## Next Steps

1. **Custom Domain** (Optional)
   - Add custom domain in Vercel settings
   - Update CORS in backend

2. **Environment Variables**
   - Never commit `.env` files
   - Use Render/Vercel dashboards for secrets

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Add analytics (Google Analytics)

4. **Performance**
   - Enable caching
   - Optimize images
   - Add loading states

---

## Support

If you encounter issues:

1. Check Render/Vercel logs
2. Verify environment variables
3. Test API endpoints directly
4. Check MongoDB Atlas connection

**Congratulations! Your AgriConnect app is now live! 🎉**
