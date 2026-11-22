# Deployment Guide — Tourist Itinerary Management System

This document outlines step-by-step instructions for deploying TravelCraft to production:
- **Frontend:** Netlify
- **Backend:** Render (or Railway / Fly.io / AWS EC2)
- **Database:** MongoDB Atlas

---

## 1. MongoDB Atlas Setup (Database)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a new cluster (Shared / Free tier is sufficient).
3. Under **Security > Database Access**, create a database user:
   - Example: username `travelcraft_admin`, password `SecurePassword123`
4. Under **Security > Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) so Render / Netlify can connect.
5. In **Database > Clusters**, click **Connect > Drivers**:
   - Copy your connection string:
     ```
     mongodb+srv://travelcraft_admin:<password>@cluster0.xxxxx.mongodb.net/tourist_itinerary?retryWrites=true&w=majority
     ```
6. (Optional) Run the database seeder locally against Atlas to populate the 15 destinations:
   ```bash
   MONGODB_URI="mongodb+srv://travelcraft_admin:SecurePassword123@cluster0.xxxxx.mongodb.net/tourist_itinerary?retryWrites=true&w=majority" npm run seed
   ```

---

## 2. Backend Deployment on Render (Node.js Web Service)

1. Sign up or log in at [Render.com](https://render.com).
2. Click **New + > Web Service**.
3. Connect your GitHub/Git repository.
4. Set the following configuration parameters:
   - **Name:** `travelcraft-backend`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (or `node index.js`)
   - **Instance Type:** Free

5. In **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `5000` | Port for Express (Render maps this automatically) |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `YourHighEntropy32CharacterSecretString` | JWT signing key |
   | `JWT_EXPIRE` | `7d` | Token lifetime |
   | `FRONTEND_URL` | `https://your-site.netlify.app` | Netlify frontend URL for CORS |

6. Click **Create Web Service**.
7. Once deployed, note your service URL (e.g., `https://travelcraft-backend.onrender.com`).
8. Verify health endpoint: `https://travelcraft-backend.onrender.com/api/health`.

---

## 3. Frontend Deployment on Netlify

### Automated via Git repository:
1. Sign up or log in at [Netlify.com](https://www.netlify.com).
2. Click **Add new site > Import an existing project**.
3. Select your Git repository.
4. Netlify will automatically detect settings from the root `netlify.toml`:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. In **Site Configuration > Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://travelcraft-backend.onrender.com/api` |
6. Update `netlify.toml` in your repository if you want API proxying:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://travelcraft-backend.onrender.com/api/:splat"
     status = 200
     force = true

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
7. Click **Deploy Site**.
8. Test all client-side navigation paths (e.g. `/destinations`, `/dashboard/composer`, `/login`) to confirm client routing and SPA redirects work.

---

## 4. Single-Origin Full-Stack Deployment (Alternative: Render Web Service)

If you prefer hosting both frontend and backend on a single domain without CORS:
1. Build the frontend into `client/dist`:
   ```bash
   npm run build
   ```
2. The Express server in `server/index.js` automatically serves static assets from `client/dist` and forwards all non-API paths to `index.html`.
3. In Render, set:
   - **Root Directory:** leave blank (project root)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. The entire application runs on a single URL.

---

## 5. Troubleshooting & Verification Checklist

- [x] **Frontend Builds Cleanly:** Run `npm run build` locally to verify 0 errors.
- [x] **Database Seeded:** Confirm all 15 destinations exist by inspecting `GET /api/destinations`.
- [x] **CORS:** Ensure `FRONTEND_URL` in backend environment matches your Netlify domain.
- [x] **Leaflet Tiles:** Tile requests are served over HTTPS via OpenStreetMap (`https://{s}.tile.openstreetmap.org`).
- [x] **SPA Routing:** Ensure `_redirects` or `netlify.toml` has `/* /index.html 200` to prevent 404s on browser reload.
