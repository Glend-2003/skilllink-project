# SkillLink - Distributed Services Platform

## Table of Contents

- [Overview](#-overview)  
- [Architecture](#️-architecture)
  - [Backend Microservices](#-backend-microservices)
  - [Client Applications](#-client-applications)
- [Quick Start](#-quick-start)
  - [Prerequisites](#-prerequisites)
  - [Deployment](#-deployment)
- [Development](#️-development)
- [Database Management](#-database-management)
- [Development Standards](#-development-standards)
- [Contributing](#-contributing)
- [Support](#-support)

---

## Overview

**SkillLink** is a cutting-edge platform engineered for connecting service providers with clients through a robust distributed system architecture. Built with modern microservices principles, it ensures:

- **High Scalability** - Independent service scaling
- **Domain Isolation** - Bounded context separation  
- **Fault Tolerance** - Resilient system design
- **Event-Driven Architecture** - Real-time communication

The ecosystem consists of a powerful backend infrastructure, an intuitive web management portal, and a cross-platform mobile application.

---

## Architecture

### Backend Microservices

Our backend follows a microservices architecture with specialized services:

| Service | Technology | Purpose | Key Features |
|---------|------------|---------|--------------|
| **Auth Service** | `.NET 9/10` | Identity & Access Management | JWT, RBAC, Entity Framework Core |
| **Service Manager** | `NestJS/TypeScript` | Service Lifecycle Management | Listings, Categories, Provider Profiles |
| **User Service** | `NestJS/TypeScript` | User Profile Management | Extended Profiles, Preferences |
| **Payment Service** | `Java/Spring Boot` | Financial Transactions | PayPal Integration, Subscriptions |
| **Notification Service** | `Node.js` | Event-Driven Messaging | Email Dispatch, System Alerts |
| **AI Service** | `FastAPI/Python` | Machine Learning | Recommendations, Search Optimization |
| **API Gateway** | `Node.js` | Request Routing | Single Entry Point, Load Balancing |

### Client Applications

| Application | Technology | Target | Features |
|-------------|------------|--------|----------|
| **Web Portal** | `React/Vite + Tailwind CSS` | Administrators | Complex Management, Analytics Dashboard |
| **Mobile App** | `Expo/React Native` | End Users | Service Discovery, Real-time Chat, Tracking |

---

## Quick Start

### Prerequisites

Ensure you have the following installed:

```bash
Docker & Docker Desktop (Required for orchestration)
Node.js v18+ (For client development)
Git (Version control)
Command Line Interface (Bash/Zsh/PowerShell)
```

### Deployment

#### 1. Environment Setup
```bash
# Clone the repository
git clone https://github.com/Glend-2003/skilllink-project
cd skilllink-project

# Verify docker-compose.yml configuration
# Check ports, database credentials, and API keys
```

#### 2. Container Orchestration
```bash
# Build and start the entire distributed system
docker-compose up -d --build
```

**This command will:**
- Pull required base images
- Compile .NET, Java, and TypeScript source code
- Initialize MySQL database with migrations
- Establish virtual network for inter-service communication

#### 3. System Verification
```bash
# Check container status
docker ps

# View service logs
docker-compose logs -f [service-name]

# Health check
curl http://localhost:3000/health
```

---

## Development

### Web Client Development
```bash
# Navigate to web client directory
cd apps/web-client

# Install dependencies
npm install

# Start development server
npm run dev

# Access: http://localhost:5173
```

### Mobile Development
```bash
# Navigate to mobile app directory
cd apps/mobile-app/skilllink

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

### Service Development
```bash
# Individual service development
cd services/[service-name]

# Follow service-specific README instructions
```

---

## Database Management

The system uses a **shared MySQL instance** with isolated schemas per service:

```sql
   Database Structure:
├──  auth_db          (Authentication data)
├──  service_db       (Service listings)
├──  user_db          (User profiles)
├──  payment_db       (Transaction records)
└──  notification_db  (Message queue)
```

**Manual Schema Updates:**
```bash
# Reference the initialization script
cat SkillLink.sql

# Apply manual changes
docker exec -it skilllink-mysql mysql -u root -p
```

---

## Development Standards

Our development follows industry best practices:

| Standard | Implementation |
|----------|----------------|
| **API Protocol** | RESTful APIs with OpenAPI documentation |
| **Authentication** | Stateless JWT-based with refresh tokens |
| **Database** | MySQL with ORM mapping (EF Core, TypeORM, JPA) |
| **Infrastructure** | Container-first deployment with Docker |
| **Documentation** | Comprehensive API docs and code comments |
| **Testing** | Unit, Integration, and E2E testing |
| **CI/CD** | Automated testing and deployment pipelines |

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow ESLint configurations
- Use Prettier for formatting
- Write meaningful commit messages
- Include tests for new features

---

## Support

Need help? We're here for you!

- **Email**: skilllinkcompany@gmail.com

