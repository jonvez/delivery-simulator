# 1. Introduction and High-Level Architecture

## Executive Summary

The Delivery Manager Application is a web-based system for managing restaurant delivery operations. This architecture document defines the full-stack technical design for building a clean, functional MVP that handles order management, driver coordination, and route visualization.

**Architecture Goals:**
- **Simplicity First**: Straightforward design patterns that are easy to understand and maintain
- **Type Safety**: TypeScript throughout the stack for reliability
- **Developer Experience**: Fast feedback loops with hot reload, clear error messages, and comprehensive testing
- **Future-Ready**: Clean separation of concerns allowing future enhancements without major refactoring

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer (Browser)"
        UI[React UI Components]
        State[React Context + Hooks]
        API_Client[API Client Service]
    end

    subgraph "Server Layer (Node.js)"
        Routes[Express Routes]
        Controllers[Controllers]
        Services[Business Logic Services]
        Validation[Zod Validation]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PG[(PostgreSQL)]
    end

    subgraph "External Services"
        Leaflet[Leaflet + OpenStreetMap]
        Nominatim[Nominatim Geocoding]
    end

    UI --> State
    State --> API_Client
    API_Client -->|REST API Calls| Routes
    Routes --> Validation
    Validation --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> PG

    UI --> Leaflet
    Services -.->|Fallback Geocoding| Nominatim

    classDef clientLayer fill:#e1f5ff,stroke:#01579b
    classDef serverLayer fill:#fff3e0,stroke:#e65100
    classDef dataLayer fill:#f3e5f5,stroke:#4a148c
    classDef externalLayer fill:#e8f5e9,stroke:#1b5e20

    class UI,State,API_Client clientLayer
    class Routes,Controllers,Services,Validation serverLayer
    class Prisma,PG dataLayer
    class Leaflet,Nominatim externalLayer
```

## Technology Stack Overview

- **Frontend**: React 18+ with TypeScript, Vite build tool, shadcn/ui component library
- **Backend**: Node.js with Express 4.x and TypeScript
- **Database**: PostgreSQL 14+ accessed via Prisma ORM
- **Deployment**: Vercel (frontend) + Railway (backend + database)
- **Testing**: Vitest, React Testing Library, Jest, Supertest, Playwright

## Architectural Principles

1. **Separation of Concerns**: Clear boundaries between presentation, business logic, and data access
2. **Type Safety**: Shared TypeScript types between frontend and backend
3. **Validation at Boundaries**: Input validation using Zod schemas at API entry points
4. **Stateless Backend**: REST API with no session state (ready for future scaling)
5. **Polling-Based Updates**: Simple 30-second polling for status updates (no WebSockets complexity)
6. **Error Handling**: Standardized error responses with proper HTTP status codes

---
