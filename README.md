# TravelCraft — Tourist Itinerary Management System

> **A professional, full-stack travel platform featuring the Smart Journey Composer (deterministic Nearest Neighbor + 2-Opt TSP route and budget optimizer).**

Designed for commercial viability, TravelCraft provides complete trip lifecycle management: route optimization, day-by-day scheduling, expense tracking, booking documentation, destination dossiers, reviews, and printable PDF exports.

---

## 🌟 Key Highlights & Features


### 1. Smart Journey Composer (Signature Feature)
- **Mathematical Distance Matrix:** Uses the Haversine spherical formula to calculate accurate distances between Indian cities and attraction coordinates.
- **Dual Plan Generation:**
  - **Plan A (Distance Optimized):** Implements **Nearest Neighbor heuristic** refined by an iterative **2-Opt local search** algorithm to minimize travel distance, transit fatigue, and transportation expenses.
  - **Plan B (Experience Optimized):** Scores destinations against user travel passions (heritage, spiritual, nature, adventure, wildlife, relaxation) and allocates budget toward top-rated excursions.
- **Dynamic Daily Scheduling:** Groups nearby attractions with realistic time constraints (morning, afternoon, evening slots).
- **Proportional Budget Allocation:** Automatically estimates and distributes costs across transport, accommodation, food, and sightseeing.
- **Interactive OpenStreetMap / Leaflet Integration:** Visualizes sequenced stop markers and route polylines.
- **One-Click Trip Persistence:** Directly converts any generated route into a real, manageable trip in MongoDB.

### 2. Comprehensive User Workspace
- **Dashboard Overview:** Metric cards for trips planned, upcoming schedules, total budget allocated, and portfolio distribution charts.
- **Trip Lifecycle Management:** Create, edit, filter, and delete multi-day travel plans.
- **Day-Wise Itinerary Planner:** Add activities, specify timings, reorder schedule, and track individual item costs.
- **Budget & Expense Tracking:** Log accommodation, transport, food, and sightseeing expenses.
- **Booking Documentation:** Record hotel vouchers, flight tickets, and train PNRs with confirmation numbers.
- **Favorites & Reviews:** Save destinations and publish traveler testimonials.
- **Client-Side PDF Export:** Clean, printable formatted PDF export without paid external APIs.
- **Secure Trip Sharing:** Unique read-only shareable URLs with tokenized access.

### 3. Administrator Console
- **Platform Analytics:** Real-time metrics on registered users, destinations, active trips, and pending reviews.
- **User & Role Management:** Manage accounts and toggle roles (`tourist`, `admin`, `agent`).
- **Destination Dossiers CRUD:** Add/edit destination metadata, coordinates, categories, and attractions.
- **Review Moderation Queue:** Review, approve, or unpublish traveler ratings.
- **Contact Inquiries:** View and process feedback dispatched from the contact portal.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router v6, Lucide React Icons |
| **Data Visualization & Maps** | Recharts (charts), Leaflet & OpenStreetMap (interactive maps) |
| **Backend** | Node.js, Express.js (RESTful architecture) |
| **Database** | MongoDB & Mongoose (schemas, compound indexes, validations) |
| **Authentication & Security** | JWT (JSON Web Tokens), bcryptjs (password hashing), Helmet, CORS, Rate Limiting |
| **Deployment Targets** | Netlify (Frontend), Render / Node.js Host (Backend), MongoDB Atlas (Database) |

---

## 🚀 One-Command Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (Local `mongod` service OR a free MongoDB Atlas connection string)

### 1. Installation
In the project root folder (`tourist_itinerary_project`):

```bash
npm install
```
*(This automatically installs root, server, and client dependencies).*

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `MONGODB_URI` points to your local MongoDB instance or Atlas cluster:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=TravelCraft_Super_Secret_JWT_Key_2024_Secure
JWT_EXPIRE=7d
MONGODB_URI=mongodb://localhost:27017/tourist_itinerary
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Database (15 Indian Destinations + Demo Accounts)
```bash
npm run seed
```

### 4. Development Execution (One Command)
```bash
npm run dev
```
Starts both the backend API server (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) concurrently.

### 5. Production Build & Execution
```bash
npm run build
npm start
```
Compiles the React application into `client/dist` and serves the complete full-stack platform through Express on `http://localhost:5000`.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@travelcraft.com` | `Admin@123` | Full admin console, user roles, destinations CRUD, review moderation |
| **Demo Tourist** | `user@travelcraft.com` | `User@123` | Personal dashboard, trips, composer, bookings, favorites, reviews |

*(You can also register a new account on the registration page or use the 1-click fill buttons on the login screen).*

---

## 📁 Project Directory Structure

```
tourist_itinerary_project/
├── client/                     # React + Vite Frontend
│   ├── public/                 # Static assets, favicon, _redirects
│   ├── src/
│   │   ├── components/         # Reusable UI, maps, cards, navigation
│   │   ├── context/            # AuthContext (state, JWT, user session)
│   │   ├── hooks/              # Custom React hooks (useAuth)
│   │   ├── layouts/            # MainLayout, DashboardLayout, AdminLayout
│   │   ├── pages/              # Public, dashboard, and admin pages
│   │   │   ├── dashboard/      # SmartJourneyComposer, MyTrips, Bookings, etc.
│   │   │   └── admin/          # AdminDashboard, UserManagement, etc.
│   │   ├── services/           # Axios domain API endpoints
│   │   ├── styles/             # Tailwind directives & typography
│   │   └── utils/              # PDF export, helpers, constants
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── config/                 # DB connection & constants
│   ├── controllers/            # Auth, destinations, trips, composer, admin
│   ├── middleware/             # JWT protect, authorize, errorHandler, validate
│   ├── models/                 # User, Destination, Trip, Itinerary, Booking, etc.
│   ├── routes/                 # Express API routes
│   ├── services/               # routeOptimizer.js (Haversine & 2-Opt algorithms)
│   ├── utils/                  # seeder.js (15 Indian destinations & demo data)
│   ├── index.js                # Express app entry & static file server
│   └── package.json
├── docs/                       # Architectural & API specifications
├── .env.example                # Sample environment variables
├── netlify.toml                # Netlify deployment configuration
├── package.json                # Root package with concurrent dev scripts
└── README.md
```

---

## 📡 API Reference Overview

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Register new user account |
| `/api/auth/login` | `POST` | Public | Authenticate user & return JWT |
| `/api/auth/me` | `GET` | Private | Retrieve current user profile |
| `/api/destinations` | `GET` | Public | Search, filter, and list destinations |
| `/api/destinations/:slug` | `GET` | Public | Retrieve destination dossier by slug |
| `/api/composer/optimize` | `POST` | Public | Run Haversine & 2-Opt algorithms (Plan A & B) |
| `/api/composer/save` | `POST` | Private | Save chosen plan as real Trip & Itineraries |
| `/api/trips` | `GET`, `POST` | Private | Manage user trips |
| `/api/itineraries/trip/:id`| `GET` | Private | Fetch day-by-day activities |
| `/api/budget/trip/:id` | `GET` | Private | Fetch expenses & budget balance |
| `/api/bookings` | `GET`, `POST` | Private | Manage reservations (hotels, trains, tours) |
| `/api/favorites` | `GET`, `POST` | Private | Manage wishlist destinations |
| `/api/reviews` | `POST` | Private | Submit destination review |
| `/api/admin/stats` | `GET` | Admin | Query platform metrics & inventory |
| `/api/admin/users` | `GET` | Admin | Manage users & permissions |
| `/api/health` | `GET` | Public | Service health & database connection status |

---

## 📄 License
MIT License. Built for travel technology innovation.
