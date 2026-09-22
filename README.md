<div align="center">

# 🏍️ Motorcycle Workshop API

**RESTful API for managing a motorcycle repair workshop** — drivers, their motorcycles, and the service orders opened for each repair.

[![Production Pipeline](https://img.shields.io/github/actions/workflow/status/BasHdezDev/motorcycle-workshop-api/production.yml?branch=main&label=production&logo=github)](https://github.com/BasHdezDev/motorcycle-workshop-api/actions/workflows/production.yml)
[![Testing Pipeline](https://img.shields.io/github/actions/workflow/status/BasHdezDev/motorcycle-workshop-api/testing.yml?label=testing&logo=github)](https://github.com/BasHdezDev/motorcycle-workshop-api/actions/workflows/testing.yml)
[![Release](https://img.shields.io/github/v/release/BasHdezDev/motorcycle-workshop-api?label=version&color=blue)](https://github.com/BasHdezDev/motorcycle-workshop-api/releases)
[![License](https://img.shields.io/badge/license-UNLICENSED-lightgrey)](#)

</div>

---

## 🧭 Planning Board

The full architecture, business rules, ER diagram, and data types were planned before writing any code. You can explore the interactive board here:

**🔗 [View the Miro planning board](https://miro.com/app/board/uXjVHx37ckw=/?share_link_id=623223523014)**

![Planning board overview](docs/board.jpg)

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| Language | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) |
| Framework | ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white) (Fastify adapter) |
| ORM | ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) |
| Database | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white) |
| Testing | ![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white) |
| Containerization | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) |
| CI/CD | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white) |
| Hosting | ![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat&logo=railway&logoColor=white) |

</div>

---

## 🏗️ Architecture

CLIENT → Fastify NestJS Adapter → Controllers → Services → Prisma → PostgreSQL

## 📦 Entities

| Entity | Description |
|---|---|
| `Driver` | A person who owns one or more motorcycles. |
| `Motorcycle` | Belongs to exactly one driver. |
| `ServiceOrder` | A repair/maintenance record for one motorcycle. |

**Relationships:** `Driver` 1─N `Motorcycle` 1─N `ServiceOrder`

## 📐 Business Rules

1. A driver can own one or more motorcycles.
2. A motorcycle belongs to exactly one driver.
3. A motorcycle's driver **cannot be changed** after registration.
4. A motorcycle cannot have more than one **active** service order at a time.
5. `licensePlate`, `chassisNumber`, `engineNumber`, and `documentNumber` must be unique.
6. A driver cannot be deleted while they have registered motorcycles.
7. A motorcycle cannot be deleted while it has associated service orders.

### Service Order lifecycle

RECEIVED → UNDER_DIAGNOSIS → UNDER_REPAIR → READY → DELIVERED


- Transitions only move forward, one step at a time — no skipping, no going back.
- **Cancellation** (`PATCH /service-orders/:id/cancel`) is only allowed while the order is `RECEIVED` or `UNDER_DIAGNOSIS`.
- An order can only be marked **`DELIVERED`** if `repairCost` has been set and `paymentCompleted` is `true`.
- `DELIVERED` and `CANCELLED` are **terminal states** — no further changes (status or otherwise) are allowed once an order reaches either one.
- `ServiceOrder` has no `DELETE` endpoint — deleting an order would erase repair history and break traceability. Orders are "closed" via cancellation or delivery instead.

---

## 📡 API Endpoints

All list endpoints (`GET /drivers`, `GET /motorcycles`, `GET /service-orders`) support pagination via `?page=1&limit=10` (default `page=1`, `limit=10`, max `limit=100`) and return:
```json
{
  "data": [ ... ],
  "meta": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
}
```

All resources also support the **`QUERY`** verb for filtered search (e.g. `QUERY /drivers` with body `{"firstName":"Juan"}`).

### Drivers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/drivers` | Create a driver |
| GET | `/drivers` | List drivers (paginated) |
| GET | `/drivers/:id` | Get a driver by id |
| PATCH | `/drivers/:id` | Update a driver |
| DELETE | `/drivers/:id` | Delete a driver |
| QUERY | `/drivers` | Search drivers by filters |

### Motorcycles
| Method | Endpoint | Description |
|---|---|---|
| POST | `/motorcycles` | Register a motorcycle |
| GET | `/motorcycles` | List motorcycles (paginated) |
| GET | `/motorcycles/:id` | Get a motorcycle by id |
| PATCH | `/motorcycles/:id` | Update a motorcycle |
| DELETE | `/motorcycles/:id` | Delete a motorcycle |
| QUERY | `/motorcycles` | Search motorcycles by filters |

### Service Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/service-orders` | Open a new service order |
| GET | `/service-orders` | List service orders (paginated) |
| GET | `/service-orders/:id` | Get a service order by id |
| PATCH | `/service-orders/:id` | Update plain fields (diagnosis, cost, etc.) |
| PATCH | `/service-orders/:id/status` | Advance the order to the next status |
| PATCH | `/service-orders/:id/cancel` | Cancel an order |
| QUERY | `/service-orders` | Search orders by filters |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Liveness check — verifies DB connectivity and reports app version |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- Docker & Docker Compose

### Environment variables
Copy `.env.example` to `.env` and fill in the values.

### Run with Docker (recommended)
```bash
docker-compose up -d --build
```
The API will be available at `http://localhost:3000`.

### Run locally (with hot-reload)
```bash
npm install
docker-compose up -d postgres   # only the database
npm run start:dev
```

### Run tests
```bash
npm run test        # unit tests
npm run test:cov     # tests + coverage report
```

---

## 🔁 CI/CD

Two independent pipelines, each running **build → test → coverage gate → deploy → health verification**:

| Pipeline | Trigger | Coverage threshold | Deploys to |
|---|---|---|---|
| `testing.yml` | Push to any branch except `main` | ≥ 60% | Testing environment (Railway) |
| `production.yml` | Push to `main` | ≥ 85% | Production environment (Railway) |

Both pipelines stop automatically — without deploying — if the build fails, any test fails, or coverage falls below the threshold.

## 🌎 Live Environments

| Environment | URL |
|---|---|
| Production (v1) | `https://motorcycle-workshop-api-production.up.railway.app` |
| Testing (v1) | `https://motorcycle-workshop-api-testing.up.railway.app` |
| **API B (v2, GKE)** | `http://35.185.40.218` |
| **Orchestrator (GKE)** | `http://35.237.27.227` |

---

## 🧩 API v2 — Multicloud Integration

Version 2 evolves the project from a single API into a **multicloud microservices
architecture**, integrating with a partner API hosted on a different cloud
provider through a dedicated Orchestrator service.

Client

│
▼

Orchestrator (GKE) ──────► API B (this project, GKE + Cloud SQL)
│
└───────────────────────► API A (partner, AWS)


Both APIs expose independent `v2` routes (`/api/v2/*` here, `/v2/*` on the
partner side) that never call each other directly — all cross-cloud
communication is brokered exclusively by the Orchestrator, so a failure on
either side degrades gracefully instead of cascading.

### 🛠️ v2 Tech Additions

<div align="center">

| Layer | Technology |
|---|---|
| Container orchestration | ![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white) (GKE Autopilot) |
| Managed database | ![Cloud SQL](https://img.shields.io/badge/Cloud_SQL-4285F4?style=flat&logo=googlecloud&logoColor=white) (PostgreSQL) |
| Image registry | ![Artifact Registry](https://img.shields.io/badge/Artifact_Registry-4285F4?style=flat&logo=googlecloud&logoColor=white) |
| Async messaging | ![Pub/Sub](https://img.shields.io/badge/Pub%2FSub-4285F4?style=flat&logo=googlecloud&logoColor=white) (topic + DLQ) |
| Cross-cloud identity | Workload Identity (GKE ↔ GCP service accounts) |

</div>

### 📡 New v2 Endpoints (API B)

All `v2` routes live under `/api/v2` and require the `x-api-key` header
(except `/api/v2/health`).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v2/health` | Health check for the v2 surface (no auth) |
| GET | `/api/v2/drivers`, `/motorcycles`, `/service-orders` | Same CRUD as v1, reusing existing business logic |
| GET | `/api/v2/service-orders/interop/random` | Returns a random **active** service order in the shared multicloud contract format (`source`, `kind`, `id`, `label`, `attributes`, `retrievedAt`) |
| GET | `/api/v2/service-orders/:id` | Returns the order **enriched with a `partner` field** — a live record fetched from API A through the Orchestrator |

**`partner.status` values:**

| Value | Meaning |
|---|---|
| `ok` | Orchestrator responded with a valid record |
| `unavailable` | Orchestrator/partner errored, timed out (1.5s), or returned malformed data — **the local order is still returned** |
| `disabled` | No Orchestrator configured — not even attempted |

> Design principle: a failure on the partner's cloud must never turn a
> perfectly good local read into an error.

### 🎭 The Orchestrator

A separate, independently deployable NestJS service (`orchestrator/`, own
`package.json` and Dockerfile, same repository) exposing:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v2/flujo` | Demonstrates the full saga-lite flow: trace-id → correlation-id → calls API B → calls API A → publishes an async event to Pub/Sub |
| GET | `/interop/:api/random` | Proxies to `inventory` (API A) or `orders` (API B), injecting the right API key and propagating `X-Correlation-Id` |
| GET | `/metrics/:api` | Proxies raw Prometheus-format metrics from either API |

### 📨 Async Messaging (Pub/Sub)

| Resource | Name |
|---|---|
| Topic | `flujo-v2` |
| Subscription | `flujo-v2-sub` (5 delivery attempts, exponential backoff) |
| Dead Letter Topic | `flujo-v2-dlq` |
| Dead Letter Subscription | `flujo-v2-dlq-sub` |

### 🔑 Additional v2 Environment Variables

API_KEY=
ORCHESTRATOR_URL=
ORCHESTRATOR_API_KEY=
INTEROP_TIMEOUT_MS=1500
PUBSUB_PROJECT_ID=
PUBSUB_TOPIC=

## 📌 Versioning

This project follows [Semantic Versioning](https://semver.org/). See the [Releases](https://github.com/BasHdezDev/motorcycle-workshop-api/releases) page for the changelog, and `GET /health` for the version currently deployed.

## 📈 Project Status

- [x] Project setup (NestJS + Fastify + Prisma + PostgreSQL)
- [x] Docker & Docker Compose
- [x] Driver, Motorcycle & ServiceOrder CRUD
- [x] QUERY verb search endpoints
- [x] Automated tests (Jest) with coverage above rubric thresholds
- [x] CI/CD pipelines for Testing and Production
- [x] Cloud deployment (Railway)
- [x] Health check with DB connectivity verification
- [x] Unified error handling
- [x] Pagination on list endpoints
- [x] Swagger / OpenAPI documentation
- [x] API v2 with independent, API-key-protected routes
- [x] Dockerized and deployed to GKE (Kubernetes)
- [x] Managed PostgreSQL via Cloud SQL with Workload Identity
- [x] Multicloud integration via a dedicated Orchestrator service
- [x] Async messaging with Pub/Sub (topic, subscription, DLQ, retries)
- [x] Cross-cloud correlation ID tracing