# Motorcycle Workshop API

RESTful API for managing a motorcycle repair workshop: drivers, their
motorcycles, and the service orders opened for each repair.

Built with **NestJS** (Fastify adapter), **Prisma ORM**, and
**PostgreSQL**, containerized with **Docker**.

## Tech Stack

- **Language:** TypeScript
- **Framework:** NestJS (Fastify adapter)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Testing:** Jest
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions

## Architecture

CLIENT → Fastify NestJS Adapter → Controllers → Services → Prisma → PostgreSQL


## Entities

| Entity         | Description                                      |
| -------------- | -----------------------------------------------  |
| `Driver`       | A person who owns one or more motorcycles.       |
| `Motorcycle`   | Belongs to exactly one driver.                   |
| `ServiceOrder` | A repair/maintenance record for one motorcycle.  |

**Relationships:** `Driver` 1─N `Motorcycle` 1─N `ServiceOrder`

## Business Rules

1. A driver can own one or more motorcycles.
2. A motorcycle belongs to exactly one driver.
3. A motorcycle's driver **cannot be changed** after registration.
4. A motorcycle cannot have more than one **active** service order at a time.
5. `licensePlate`, `chassisNumber`, `engineNumber`, and `documentNumber` must be unique.
6. A driver cannot be deleted while they have registered motorcycles.
7. A motorcycle cannot be deleted while it has associated service orders.

### Service Order lifecycle

A service order moves through a fixed state machine:

RECEIVED → UNDER_DIAGNOSIS → UNDER_REPAIR → READY → DELIVERED


- Transitions only move forward, one step at a time — no skipping, no going back.
- **Cancellation** (`PATCH /service-orders/:id/cancel`) is only allowed while
  the order is `RECEIVED` or `UNDER_DIAGNOSIS`.
- An order can only be marked **`DELIVERED`** if `repairCost` has been set
  and `paymentCompleted` is `true`.
- `DELIVERED` and `CANCELLED` are **terminal states** — no further status
  changes are allowed once an order reaches either one.

#### Why there's no `DELETE` for Service Orders

`ServiceOrder` intentionally has no `DELETE` endpoint. Deleting an order
would erase the workshop's repair history and break traceability for the
associated motorcycle and driver. Instead of physical deletion, orders are
"closed" through the state machine above — either cancelled or delivered.

## API Endpoints

### Drivers
| Method | Endpoint         | Description        |
| ------ | ---------------- | ------------------- |
| POST   | `/drivers`       | Create a driver      |
| GET    | `/drivers`       | List all drivers     |
| GET    | `/drivers/:id`   | Get a driver by id    |
| PATCH  | `/drivers/:id`   | Update a driver       |
| DELETE | `/drivers/:id`   | Delete a driver       |

### Motorcycles
| Method | Endpoint             | Description             |
| ------ | --------------------- | ------------------------ |
| POST   | `/motorcycles`         | Register a motorcycle      |
| GET    | `/motorcycles`         | List all motorcycles       |
| GET    | `/motorcycles/:id`     | Get a motorcycle by id      |
| PATCH  | `/motorcycles/:id`     | Update a motorcycle          |
| DELETE | `/motorcycles/:id`     | Delete a motorcycle          |

### Service Orders
| Method | Endpoint                      | Description                    |
| ------ | ------------------------------ | -------------------------------- |
| POST   | `/service-orders`               | Open a new service order          |
| GET    | `/service-orders`                | List all service orders           |
| GET    | `/service-orders/:id`            | Get a service order by id          |
| PATCH  | `/service-orders/:id`            | Update plain fields (diagnosis, cost, etc.) |
| PATCH  | `/service-orders/:id/status`     | Advance the order to the next status |
| PATCH  | `/service-orders/:id/cancel`     | Cancel an order (RECEIVED/UNDER_DIAGNOSIS only) |

## Getting Started

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
npm run test:e2e     # e2e tests
npm run test:cov     # coverage
```

## Project Status

- [x] Project setup (NestJS + Fastify + Prisma + PostgreSQL)
- [x] Docker & Docker Compose
- [x] Driver CRUD
- [x] Motorcycle CRUD
- [x] ServiceOrder CRUD + status transitions
- [ ] QUERY verb / advanced search endpoints
- [ ] Automated tests
- [ ] CI/CD pipelines (Testing / Production)
- [ ] Cloud deployment