# UCAB - Production-Ready MERN Stack Cab Booking System

UCAB is a full-featured, responsive, and secure MERN stack taxi dispatching application built for passengers, drivers, and administrators. 

It closely matches the target visual theme, typography (Poppins), and card-shadow structures while integrating advanced capabilities like driver onboarding, search telemetry, fare estimates, checkout payments, and printable invoices.

---

## Technical Stack
- **Frontend**: React (Vite), React Router DOM, Axios, Bootstrap 5, Bootstrap Icons, Custom CSS.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose.
- **Security & Media**: JWT (JSON Web Tokens), bcryptjs, Multer file uploads.
- **Configurations**: dotenv, cors.

---

## Key Features

1. **Role-Based Authentication**: Custom auth contexts for Passengers, Driver Partners, and System Administrators, protected by bcrypt hashing and secure JWT headers.
2. **Driver Onboarding & Verification**: Dedicated Driver registration tab capturing licenses, vehicle plate numbers, and categories. Accounts remain `Pending` until manually audited and verified by admins in the control panel.
3. **Optimized Nearby Cab Search**: Passengers can type in location parameters (e.g. city) to perform compound-indexed searches, scanning for active, unbooked drivers located nearby.
4. **Interactive Fare Estimation**: Fare calculator dynamically processing trip distance, base vehicle class rates, GST/taxes (8%), and service fees ($15) before booking.
5. **Real-time Ride Tracking (Simulated)**: Active ride panel displaying step-by-step progress pipelines (Pickup arriving, Trip in progress, Approaching, Completed), updating ETAs, telemetry, and mock speed parameters in real time.
6. **Online Checkout & Receipt Printing**: Simulated card processing checkout portal that updates payment status, logs transaction IDs, and generates a printable invoice receipt complete with fare breakdowns and mock verification QR codes.
7. **Support Helpdesk Ticketing**: Interactive support module. Passengers and drivers can open support tickets and message support. Admins can view tickets, write replies, and mark tickets as Resolved.
8. **MongoDB Query Optimization**: MongoDB indexing (Compound and Unique sparse indexes) implemented across User profiles, Cabs, and Bookings to speed up queries.
9. **Centralized Logging & Error Handling**: Global Express error handler catches validation failures, duplicate keys, and authorization expirations, outputting standardized JSON payloads.

---

## Directory Layout
```
UCAB Project/
├── backend/
│   ├── controllers/      # Business logic (users, drivers, cabs, bookings, support)
│   ├── db/               # config.js Mongoose configuration
│   ├── middlewares/      # auth rules, multer uploads, error logger
│   ├── models/           # Mongoose schemas (User, Admin, Car, Booking, SupportTicket)
│   ├── routes/           # Express endpoint routers
│   ├── uploads/          # Physical directory storing uploaded cab images
│   ├── .env              # Environment configurations
│   └── server.js         # Entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/       # Media files
    │   ├── context/      # AuthContext global state provider
    │   ├── pages/        # Passenger, Driver, and Admin screens
    │   ├── App.jsx       # App routing & guards
    │   ├── main.jsx      # Rendering mount point
    │   ├── index.css     # Global style tokens
    │   └── App.css       # Layout utility classes
```

---

## Installation & Setup

### Prerequisites
- Node.js installed locally.
- MongoDB Server running locally on `mongodb://127.0.0.1:27017` (or remote Atlas URI).

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. The dependencies are already configured in `package.json`. Run:
   ```bash
   npm install
   ```
3. Verify `.env` parameters:
   ```env
   PORT=8000
   MONGO_URI=mongodb://127.0.0.1:27017/Ucab
   JWT_SECRET=your_secret_key_ucab_2026
   CLIENT_URL=http://localhost:5173
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *Expected output: MongoDB Connected and server listening on port 8000.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173` to interact with UCAB.

---

## Database Index Optimization Specifications
To guarantee production-level query speeds under load, we have implemented the following indexes inside the Mongoose schemas:
- **UserSchema**: 
  - Unique index on `email`.
  - Compound index on `{ role: 1, "driverDetails.status": 1, "driverDetails.currentLocation.city": 1 }` for fast queries of available driver locations.
  - Unique sparse indexes on `driverDetails.licenseNumber` and `driverDetails.vehicleNumber` (allowing users to bypass fields without index clashes).
- **CarSchema**:
  - Unique index on plate `number`.
  - Compound index on `{ city: 1, status: 1, type: 1 }` to optimize the search filters for available cabs in specific cities.
- **BookingSchema**:
  - Compound indexes on `{ userId: 1, status: 1 }` and `{ driverId: 1, status: 1 }` to speed up user dashboard list rendering.
