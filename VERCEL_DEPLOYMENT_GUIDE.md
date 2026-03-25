# Vercel Deployment Guide - WST JCC E-Commerce

Complete walkthrough to deploy your application to Vercel.

## Phase 1: MongoDB Atlas Setup (5-10 minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Create an account"**
3. Sign up with email or Google
4. Verify your email

### Step 2: Create a Cluster (Free Tier)
1. After login, click **"Create a Deployment"**
2. Select **M0 (Free)** cluster tier
3. Choose your provider (AWS/Google Cloud/Azure) - doesn't matter for free tier
4. Select a region closest to you
5. Click **"Create Deployment"**
6. Wait 3-5 minutes for cluster to initialize

### Step 3: Get Your Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Drivers"**
4. Select **"Node.js"** from the language dropdown
5. Version **4.1 or later**
6. **Copy the connection string**
   - It will look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
   - Save this securely - you'll need it soon!

### Step 4: Create a Database User
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set Username: `ecommerce_user` (or your choice)
5. Set Password: Create a strong password
6. **Copy the username and password** - you'll need them in the connection string
7. Click **"Add User"**

### Step 5: Configure Network Access
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow access from anywhere"** (for development)
   - In production, you'd restrict this to your server IPs
4. Click **"Confirm"**

### Step 6: Create a Database
1. Go back to **"Database"** 
2. Click **"Browse Collections"**
3. Click **"Create Database"** if prompted
4. Name: `wst-jcc-ecommerce`
5. First collection: `users`
6. Click **"Create"**

**You now have your MongoDB connection string and database ready!**

---

## Phase 2: Git Preparation (5 minutes)

Make sure all your changes are committed to GitHub:

```bash
# Navigate to your project
cd c:\Users\JAYCEE\Documents\GitHub\WEBTECH-JCC-ECOMMERCE

# Check all files are tracked
git status

# Add all changes
git add .

# Commit changes
git commit -m "ref: Restructure backend for Vercel deployment

- Move backend to /api for serverless functions
- Update CORS to accept Vercel URLs
- Change frontend API URLs to relative paths
- Add vercel.json and .vercelignore config
- Create root package.json for Vercel build"

# Push to GitHub
git push origin main
```

---

## Phase 3: Vercel Deployment (10 minutes)

### Step 1: Connect GitHub to Vercel
1. Go to https://vercel.com
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Click **"Approve and Install"**

### Step 2: Import Your Project
1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find and click your **WEBTECH-JCC-ECOMMERCE** repository
3. Click **"Import"**

### Step 3: Configure Project Settings
1. **Project Name**: `wst-jcc-ecommerce` (or your choice)
2. **Framework Preset**: Leave as **"Other"**
3. **Root Directory**: Leave blank (root of repo)
4. **Build Command**: Leave blank or set to: `npm install --legacy-peer-deps`
5. **Output Directory**: Leave blank
6. **Install Command**: `npm install --legacy-peer-deps`

### Step 4: Add Environment Variables
This is critical! Vercel needs your MongoDB connection string and other secrets.

Click **"Environment Variables"** and add:

1. **Variable Name**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string (from Phase 1)
   - Example: `mongodb+srv://ecommerce_user:password@cluster.mongodb.net/wst-jcc-ecommerce?retryWrites=true&w=majority`
   - Select: **"Production"**, **"Preview"**, **"Development"**
   - Click **"Add"**

2. **Variable Name**: `JWT_SECRET`
   - **Value**: Create a strong random string (use random generator or UUID)
   - Example: `your-super-secret-jwt-key-change-this-in-production`
   - Select: **"Production"**, **"Preview"**, **"Development"**
   - Click **"Add"**

3. **Variable Name**: `NODE_ENV`
   - **Value**: `production`
   - Select: **"Production"**
   - Click **"Add"**

4. **Variable Name**: `CLOUDINARY_CLOUD_NAME`
   - **Value**: Your Cloudinary cloud name (from your .env)
   - Click **"Add"**

5. **Variable Name**: `CLOUDINARY_API_KEY`
   - **Value**: Your Cloudinary API key (from your .env)
   - Click **"Add"**

6. **Variable Name**: `CLOUDINARY_API_SECRET`
   - **Value**: Your Cloudinary API secret (from your .env)
   - Click **"Add"**

7. **Variable Name**: `GOOGLE_CLIENT_ID`
   - **Value**: Your Google OAuth client ID (from your .env)
   - Click **"Add"**

### Step 5: Deploy!
1. Click **"Deploy"** button at the bottom
2. Wait 2-3 minutes for deployment to complete
3. You'll see a success message with your deployment URL
   - Format: `https://wst-jcc-ecommerce.vercel.app`

### Step 6: Wait for Deployment
Monitor the build log:
- Watch the build process complete
- You should see no errors
- Once complete, you'll get a URL like `https://[project-name].vercel.app`

**Congratulations! Your app is deployed! 🎉**

---

## Phase 4: Test Your Deployment (10 minutes)

### Test 1: Check Frontend
1. Visit your Vercel URL (e.g., `https://wst-jcc-ecommerce.vercel.app`)
2. Verify all pages load (shop, admin dashboard, product pages)
3. Check that CSS and images load correctly

### Test 2: Test API Endpoints
Open browser console (F12) and test:

```javascript
// Test API health check
fetch('/api/health').then(r => r.json()).then(console.log)

// Test database connection
fetch('/api/test/connection').then(r => r.json()).then(console.log)

// Test get all products
fetch('/api/products').then(r => r.json()).then(console.log)

// Test get categories
fetch('/api/categories').then(r => r.json()).then(console.log)
```

### Test 3: Test Authentication
1. Visit admin login page
2. Try logging in with admin credentials
3. Try Google OAuth login
4. Verify cart functionality

### Test 4: Check Logs
1. Go to your Vercel project dashboard
2. Click **"Deployment"** tab
3. Click the latest deployment
4. View **"Logs"** for any errors

---

## Phase 5: Post-Deployment Tasks (Optional but Recommended)

### 1. Add Custom Domain
1. On Vercel dashboard, go to **"Settings" → "Domains"**
2. Add your custom domain
3. Follow DNS setup instructions from your domain provider

### 2. Enable Automatic Deployments
(Already enabled by default)
- Any push to main branch auto-deploys
- Set up preview deployments for pull requests

### 3. Setup Error Monitoring
1. On Vercel dashboard, go to **"Settings" → "Integrations"**
2. Add Sentry or similar APM service (optional)

### 4. Monitor Performance
- Use Vercel Analytics (if available in your plan)
- Check deployment logs regularly
- Monitor MongoDB Atlas usage

---

## Troubleshooting

### Problem: Build fails with "module not found"
**Solution**: 
- Check that all dependencies are in root `package.json`
- Run locally: `npm install --legacy-peer-deps`
- Verify all imports use correct relative paths

### Problem: API endpoints return 404
**Solution**:
- Check `vercel.json` rewrites configuration
- Ensure `/api/index.js` exists
- Check deployment logs in Vercel dashboard

### Problem: CORS errors when calling API
**Solution**:
- Update the CORS origin in `/api/index.js` to include your Vercel URL
- Test that CORS is allowing your domain
- Check browser console for exact error message

### Problem: Database connection fails
**Solution**:
- Verify `MONGODB_URI` environment variable is set correctly
- Check MongoDB Atlas whitelist includes Vercel IPs (should be "allow all")
- Verify database user credentials are correct
- Test connection string locally: `node -e "require('mongoose').connect(process.env.MONGODB_URI).then(()=>console.log('✓ Connected'))"`

### Problem: Images/Assets not loading
**Solution**:
- Verify `/assets` folder is being served correctly
- Check that static files path in `/api/index.js` points to parent directory correctly
- Consider using Cloudinary for all images (already configured)

---

## Environment Variables Reference

```
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Image Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Node Environment
NODE_ENV=production
```

---

## Next Steps After Deployment

1. **Test thoroughly** in production environment
2. **Monitor logs and performance** regularly
3. **Set up error alerts** if available
4. **Keep dependencies updated** (npm audit, npm update)
5. **Consider adding CI/CD pipeline** (GitHub Actions)
6. **Enable database backups** in MongoDB Atlas
7. **Plan for scaling** (MongoDB pricing, Vercel Pro plan if needed)

---

## Quick Reference: File Changes Made

✅ **Created**:
- `/api/index.js` - Main Express app (serverless entry point)
- `/vercel.json` - Vercel deployment configuration
- `/.vercelignore` - Files to exclude from deployment
- `/package.json` - Root-level dependencies for Vercel

✅ **Moved**:
- `backend/config/*` → `/api/config/`
- `backend/controllers/*` → `/api/controllers/`
- `backend/models/*` → `/api/models/`
- `backend/middleware/*` → `/api/middleware/`
- `backend/routes/*` → `/api/routes/`

✅ **Updated**:
- `assets/js/admin-auth.js` - API URLs to `/api`
- `assets/js/user-auth.js` - API URLs to `/api`
- `assets/js/shop.js` - API URLs to `/api`
- `assets/js/single-product.js` - API URLs to `/api`

---

## Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Express.js**: https://expressjs.com/
- **Node.js**: https://nodejs.org/docs/

---

**Happy Deploying! 🚀**
