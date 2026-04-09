# NestJS Enterprise Template

A high-performance, production-ready NestJS template designed for scalability, speed, and modern developer experience. This project serves as a robust foundation for building enterprise-grade backends with essential features pre-configured.

## 🚀 Overview

This template is built on top of **NestJS 11** and utilizes **Fastify** for the highest possible performance. It comes integrated with **SWC** for blazing-fast compilation and a modular architecture that separates core infrastructure from application logic.

### Why use this template?
- **Speed**: SWC compiler + Fastify platform = minimal overhead.
- **Reliability**: Graceful shutdown services and robust queue management.
- **Batteries-Included**: Pre-built modules for Emails, Notifications, and Queues.
- **Enterprise-Ready**: Strict linting, commit standards, and Docker-first approach.

---

## ✨ Features

### 🛠 Core Infrastructure
- **Fastify Platform**: Optimized for low overhead and high throughput.
- **SWC Integration**: Replaces `ts-node` and `tsc` for near-instant builds and execution.
- **Graceful Shutdown**: Custom `ShutdownService` to handle process signals (SIGTERM, SIGINT) and ensure clean exits.
- **Modular Core**: A dedicated `libs/core` for shared filters, decorators, and HTTP response builders.

### 📬 Messaging & Background Tasks
- **BullMQ Integration**: High-performance Redis-based queues for asynchronous processing.
- **Email Module**: Multi-provider support (SMTP included) with dedicated background processors.
- **Notification Module**: Pluggable architecture supporting **FCM (Firebase Cloud Messaging)** and **OneSignal**.
- **Worker Mode**: Scalable worker logic for processing heavy background tasks outside the main API thread.

### 🌍 Globalization & UX
- **Internationalization (i18n)**: Built-in support for multi-language responses and error messages.
- **Standardized Responses**: Unified `DataResponseBuilder` for consistent API output.
- **Advanced Metadata**: Dynamic metadata generation for SEO and social sharing.

### 🧹 Quality & DX
- **Husky & Commitlint**: Enforces conventional commit messages.
- **Lint-Staged**: Automatically runs ESLint and Prettier on changed files.
- **ESLint 9**: Modern linting configuration for TypeScript.

---

## 🏗 Project Structure

```text
/
├── libs/
│   └── core/           # Shared infrastructure logic
├── src/
│   ├── common/         # Global DTOs and utilities
│   ├── emails/         # Email providers and queue processors
│   ├── notifications/  # Notification providers (FCM, OneSignal)
│   ├── queues/         # Global BullMQ configuration
│   ├── i18n/           # Translation files (JSON)
│   └── app.module.ts   # Core application orchestration
├── Dockerfile          # Optimized production build
└── docker-compose.yml  # Local development infrastructure (Redis, etc.)
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v20+)
- pnpm (Recommended)
- Docker & Docker Compose

### Local Development

1. **Clone and Install**
   ```bash
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

3. **Start Infrastructure**
   ```bash
   docker-compose up -d
   ```

4. **Run in Watch Mode**
   ```bash
   pnpm run start:dev
   ```

---

## 🐳 Docker Deployment

The project includes a production-ready `Dockerfile` and a `docker-compose.yml` for orchestration.

```bash
# Build and run with Docker
docker-compose up --build
```

---

## 🛠 Use Cases

1. **SaaS Backends**: Rapidly spin up scalable APIs with built-in notification and billing hooks.
2. **Notification Engines**: A dedicated service to handle massive volumes of Push and Email alerts.
3. **Microservices**: Use as a scaffold for high-performance microservices in a distributed architecture.
4. **Global Apps**: Products requiring robust i18n and localized error handling from day one.

---

## 🛡 License

This template is [MIT licensed](LICENSE).
