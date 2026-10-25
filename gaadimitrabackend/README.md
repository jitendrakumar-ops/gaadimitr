# GaadiMitra — Production-Ready Vehicle Booking Backend

A high-performance, secure, and production-ready vehicle booking and ride-hailing backend built with **Node.js, Express, MongoDB, Socket.IO, Redis, and BullMQ**.

---

## 🚀 Key Features

* **Direct Driver Booking Engine**: Passengers search and select nearby drivers directly based on real-time GPS location and vehicle category.
* **Atomic State Machine**: Bulletproof booking lifecycle transitions (`requested` ➔ `accepted` ➔ `driverArriving` ➔ `driverArrived` ➔ `tripStarted` ➔ `tripCompleted`), preventing race conditions and double bookings using atomic MongoDB updates.
* **Real-time Telemetry & Tracking**: Live GPS broadcast using Socket.IO, with fast Redis geospatial caching (`GEOADD`) to minimize MongoDB load.
* **OTP-Based Stateless Authentication**: Fast SMS/OTP verification backed by Redis with MongoDB TTL fallback, and automatic JWT access/refresh token rotation with SHA-256 hashed storage.
* **Dynamic Fare Calculation Engine**: Automated pricing engine factoring in base fare, chargeable distance, time-based tariffs, GST tax, surge pricing multipliers, and minimum fare thresholds.
* **In-App Messaging & Media**: One-to-one messaging between driver and passenger with AWS S3 attachment support and read receipts.
* **Push Notifications**: Firebase Cloud Messaging (FCM) integration with multicast push delivery and automatic inactive token pruning.
* **Background Processing**: BullMQ job queues for booking auto-expiration (if driver doesn't accept within timeout) and async notifications.
* **Production Security Hardening**: Helmet, CORS, Express rate limiting, Mongo sanitization, Zod request validation, and strict Role-Based Access Control (RBAC).

---

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| **Runtime** | Node.js (v20+ / v22+ / v24+ ESM native) |
| **Framework** | Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Cache & Geo-indexing** | Redis (ioredis) |
| **Message Queues** | BullMQ |
| **WebSockets** | Socket.IO |
| **Object Storage** | AWS S3 (`@aws-sdk/client-s3`) |
| **Push Notifications** | Firebase Admin SDK (FCM) |
| **Validation** | Zod |
| **Logging** | Pino & Pino-Http |
| **Testing** | Jest & Supertest |

---

## 📂 Architecture & Directory Structure

```text
src/
├── app.js                   # Express application configuration & middleware chain
├── server.js                # Server bootstrap, Socket.IO binding, graceful shutdown
├── config/                  # Database, Redis, S3, Firebase initializers
│   ├── database.js
│   ├── firebase.js
│   ├── redis.js
│   └── s3.js
├── constants/               # System enums, status transitions, vehicle rate cards
│   ├── booking.js
│   └── fare.js
├── controllers/             # Thin controllers translating HTTP to services
│   ├── auth.controller.js
│   ├── booking.controller.js
│   ├── chat.controller.js
│   ├── driver.controller.js
│   ├── rating.controller.js
│   ├── user.controller.js
│   └── vehicle.controller.js
├── middleware/              # Auth, RBAC, error handling, rate limits, uploads
│   ├── auth.middleware.js
│   ├── errorHandler.middleware.js
│   ├── rateLimit.middleware.js
│   ├── upload.middleware.js
│   └── validate.middleware.js
├── models/                  # Mongoose data schemas & GeoJSON indexes
│   ├── Booking.js
│   ├── Chat.js
│   ├── DeviceToken.js
│   ├── Driver.js
│   ├── Message.js
│   ├── Notification.js
│   ├── Otp.js
│   ├── Rating.js
│   ├── RefreshToken.js
│   ├── User.js
│   └── Vehicle.js
├── routes/                  # Modular API route definitions
│   ├── auth.routes.js
│   ├── booking.routes.js
│   ├── chat.routes.js
│   ├── driver.routes.js
│   ├── index.js
│   ├── rating.routes.js
│   ├── user.routes.js
│   └── vehicle.routes.js
├── services/                # Pure business logic layer
│   ├── auth.service.js
│   ├── booking.service.js
│   ├── chat.service.js
│   ├── driver.service.js
│   ├── fare.service.js
│   ├── notification.service.js
│   ├── otp.service.js
│   └── s3.service.js
├── sockets/                 # Socket.IO event handlers and rooms
│   ├── booking.socket.js
│   ├── location.socket.js
│   └── socket.js
├── utils/                   # Helpers, JWT, response formatters, logger
│   ├── helpers.js
│   ├── jwt.js
│   ├── logger.js
│   └── response.js
├── validators/              # Zod validation schemas
│   ├── auth.validator.js
│   ├── booking.validator.js
│   ├── driver.validator.js
│   └── user.validator.js
└── jobs/                    # BullMQ background workers & schedulers
    ├── booking.job.js
    └── notification.job.js
```

---

## 🚦 Getting Started

### 1. Prerequisites
* **Node.js**: v20 or newer
* **MongoDB**: v6 or newer
* **Redis**: v7 or newer

### 2. Environment Variables
Copy `.env.example` to `.env` and adjust the variables:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
To run directly with native Node.js (no build or compile step needed):
```bash
# Production mode
npm start

# Development mode (with native hot reload)
npm run dev
```

---

## 🐳 Running with Docker

Run the entire stack (API, MongoDB, Redis) via Docker Compose:

```bash
docker-compose up -d --build
```

---

## 📡 API Reference Summary

### Authentication (`/api/v1/auth`)
* `POST /send-otp`: Request 6-digit OTP via SMS (returns dev OTP in non-production).
* `POST /verify-otp`: Verify OTP, returns JWT `accessToken` and `refreshToken`.
* `POST /refresh-token`: Exchange valid refresh token for a fresh token pair.
* `POST /logout`: Invalidate session and revoke refresh token.

### User (`/api/v1/users`)
* `GET /me`: Get authenticated user profile.
* `PATCH /me`: Update profile name, email.
* `POST /me/profile-image`: Upload avatar to AWS S3 (`multipart/form-data`).
* `POST /me/device-token`: Register FCM device token for push notifications.
* `GET /notifications`: Get paginated notification history.
* `PATCH /notifications/:id/read`: Mark notification as read.

### Driver & Fleet (`/api/v1/drivers`)
* `GET /`: Search nearby available and approved drivers (`latitude`, `longitude`, `radiusKm`, `vehicleType`).
* `GET /me`: Driver self profile & vehicle stats.
* `GET /:driverId`: Public profile of specific driver.
* `PATCH /status`: Toggle driver availability (`online`, `offline`).
* `PATCH /location`: Update real-time GPS coordinate point and heading.
* `POST /documents/:docType`: Upload DL, ID, or police verification document.
* `PATCH /:driverId/approval`: Admin approval route (`approved`, `rejected`).

### Vehicle Management (`/api/v1/vehicles`)
* `POST /`: Register driver's vehicle (`vehicleType`, `vehicleNumber`, `brand`, `model`, `year`).
* `GET /me`: Get vehicle details.
* `PATCH /me`: Update vehicle information.
* `POST /me/image`: Upload vehicle photo to S3.

### Booking Lifecycle (`/api/v1/bookings`)
* `GET /estimate`: Calculate estimated fare (`pickupLat`, `pickupLng`, `dropLat`, `dropLng`, `vehicleType`).
* `POST /`: Create direct booking request for a specific driver.
* `GET /`: List bookings with pagination and status filters.
* `GET /:bookingId`: Get booking details and fare breakdown.
* `POST /:bookingId/accept`: Driver accepts ride.
* `POST /:bookingId/reject`: Driver declines ride.
* `POST /:bookingId/arriving`: Driver is en route to pickup.
* `POST /:bookingId/arrived`: Driver has arrived at pickup.
* `POST /:bookingId/start`: Driver starts trip.
* `POST /:bookingId/complete`: Driver completes trip and marks payment.
* `POST /:bookingId/cancel`: Cancel booking with reason.

### Chat & Ratings (`/api/v1/chats` & `/api/v1/ratings`)
* `GET /:bookingId/messages`: Retrieve chat history for active booking.
* `POST /:bookingId/messages`: Send text or media attachment message.
* `PATCH /:bookingId/read`: Mark messages as read.
* `POST /api/v1/ratings`: Rate completed trip (1 to 5 stars) and write review.
* `GET /api/v1/ratings/driver/:driverId`: Get driver's reviews and rolling rating average.

---

## ⚡ Real-Time Socket.IO Events

### Client Connections & Rooms
Clients authenticate during handshake using `Authorization: Bearer <TOKEN>`.
* Passenger automatically joins room: `user:${userId}`
* Driver automatically joins rooms: `user:${userId}` and `driver:${driverId}`
* Active rides join room: `booking:${bookingId}`

### Real-Time Event Matrix
| Event Name | Direction | Payload Description |
|---|---|---|
| `booking:request` | Server ➔ Driver | New ride request broadcast to selected driver |
| `booking:accepted` | Server ➔ User | Notification that driver accepted ride |
| `booking:rejected` | Server ➔ User | Notification that driver declined ride |
| `driver:arriving` | Server ➔ User | Driver en route to pickup location |
| `driver:arrived` | Server ➔ User | Driver arrived at pickup point |
| `trip:started` | Server ➔ User | Trip has begun |
| `trip:completed` | Server ➔ User | Trip completed with final fare breakdown |
| `booking:cancelled` | Server ➔ Both | Booking cancellation broadcast |
| `driver:location:update` | Driver ➔ Server / Server ➔ User | Live GPS telemetry coordinates & heading |
| `chat:message` | Server ➔ Both | New in-ride chat message or attachment |
| `chat:read` | Server ➔ Both | Read receipt confirmation |

---

## 🧪 Testing

Run test suites using Jest:
```bash
# Run unit, security, and fare tests
npm test tests/security.test.js tests/fare.test.js tests/helpers.test.js tests/jwt.test.js tests/validators.test.js
```

---

## 🛡️ Production Best Practices Implemented

* **Backend is Source of Truth**: All status transitions, distances, and fares are calculated and verified server-side.
* **Double-Booking Protection**: Enforces atomic checks so users cannot request multiple concurrent rides, and drivers cannot accept multiple active rides simultaneously.
* **Safe Error Handling**: Custom `AppError` class returns structured errors without leaking server stack traces in production.
* **Cloud Resilience**: Clean fallbacks for AWS S3 and Firebase Admin SDK when running in testing or offline environments.
