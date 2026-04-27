# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DoctorHouse is a telemedicine platform for on-demand at-home doctor visits in Peru. It is a JavaScript monorepo with two workspaces: `api` (Express.js REST API) and `mobile` (React Native/Expo app), plus a web prototype (`index.html`).

## Commands

### Full Stack (Docker)
```bash
npm run docker:up       # Build and start all services (postgres, api, nginx)
npm run docker:down     # Stop all services
npm run docker:logs     # Tail API logs
```

### API Development
```bash
npm run api:dev         # Start API with auto-reload (node --watch)
npm run api:start       # Start API in production mode
```

### Database
```bash
# API migrations run automatically on startup via api/src/db/migrations/
npm run seed --workspace=api    # Seed test data
docker exec -it <postgres-container> psql -U dh_user -d doctorhouse
```

### Mobile
```bash
npm run mobile:start    # Start Expo dev server
npm run mobile:android  # Start on Android emulator
```

There is no test runner or linter configured in this project.

## Architecture

### Request Flow & Security Layers

All public traffic enters through **Nginx** (ports 80/443), which handles TLS termination and rate limiting (30 req/s global, 2 req/s auth), then proxies to the Express API on port 3000.

Express applies middleware in this order:
1. `middleware/rateLimit.js` — express-rate-limit
2. `middleware/apiKey.js` — validates `X-API-Key` header + HMAC-SHA256 signature of the request body
3. `middleware/auth.js` — JWT bearer token (applied per-router, not globally)
4. `middleware/auditLog.js` — logs all requests/responses
5. Route handlers
6. `middleware/errorHandler.js` — centralized error responses

The mobile app signs every request using `mobile/src/crypto.js` (HMAC-SHA256 with `API_SIGNING_SECRET`).

### Visit Lifecycle

The core domain object is a `visit`. The status enum flows: `pending → matched → on_way → arrived → completed` (or `cancelled`). Key steps:

1. User submits symptoms, location, urgency via `POST /visits`
2. API finds the nearest available doctor using a Haversine geospatial query on the `doctors` table
3. Doctor is assigned, ETA calculated, visit status → `matched`
4. Payment processed via one of three Peruvian gateways: **Culqi** (cards), **Niubiz/VisaNet** (cards), or **PagoEfectivo** (cash/bank) — see `api/src/services/`
5. Doctor updates status as they travel and complete the visit
6. User submits a review via `POST /reviews`

### Authentication

OTP-based, stateless JWT:
- `POST /auth/otp` — generates a 6-digit code stored in `otp_codes` table (5-minute TTL)
- `POST /auth/verify` — validates OTP, issues JWT
- JWT is signed with `JWT_SECRET` and validated in `middleware/auth.js`

### Database Schema (key relationships)

```
users ──< visits >── doctors
visits ──< visit_symptoms
visits ──< visit_patient_info
visits ──< payments
visits ── reviews
injectables ── visits (for injectable service type)
```

`visits.service_type` is an enum: `doctor_visit | injectable | telemedicine`.

Migrations run in numeric order from `api/src/db/migrations/` on API startup.

### Mobile App State

Global state lives in `mobile/src/AppContext.js` (React Context). It holds urgency level, location, symptoms, payment method, and active visit. Screen navigation is a stack defined in `mobile/App.js`.

### Environment

All secrets and config come from `.env` (see `.env.example`). The Docker Compose setup maps `.env` into the API container. PostgreSQL runs on **port 5434** (non-standard, to avoid conflicts).
