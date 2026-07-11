markdown
# Lush

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)]()

---

**Live API:** [https://lush-api-server.vercel.app](https://lush-api-server.vercel.app/)

---

## Overview

**Lush** is a monorepo for an e-commerce boutique with a content management back‑office (multilingual FR/AR text and images), a REST API, and a PostgreSQL database fully typed end‑to‑end with Zod and Drizzle ORM.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Build & Typecheck](#build--typecheck)
- [Deployment](#deployment)
- [License](#license)

---

## Architecture

The project is organised as a **pnpm workspace monorepo**, clearly separating applications (`artifacts/`) from shared and generated libraries (`lib/`):
┌─────────────────────┐ ┌──────────────────────┐
│ lush-boutique │ HTTP │ api-server │
│ (frontend Vite/React)│──────▶│ (Express + Drizzle) │
└─────────────────────┘ └───────────┬──────────┘
│
▼
┌──────────────────┐
│ PostgreSQL │
└──────────────────┘

text

API types are **automatically generated** from the OpenAPI specification (`lib/api-spec`) into Zod schemas (`lib/api-zod`), ensuring strict consistency between the API contract, the back‑end, and the front‑end.

---

## Tech Stack

| Area                 | Technologies |
|----------------------|--------------|
| **Frontend**         | React 19, Vite 7, TypeScript, Tailwind CSS 4, Radix UI, TanStack Query, Wouter |
| **Backend / API**    | Express 5, Pino (logging), Node.js |
| **Database**         | PostgreSQL, Drizzle ORM, Drizzle Kit |
| **Validation & types** | Zod, OpenAPI generation via Orval |
| **Tooling**          | pnpm workspaces, TypeScript (project references), esbuild |
| **Deployment**       | Vercel |

---

## Repository Structure
lush-main/
├── artifacts/
│ ├── api-server/ # REST API (Express) — deployed on Vercel
│ ├── lush-boutique/ # Front‑end application (store + admin)
│ └── mockup-sandbox/ # UI mockup sandbox
├── lib/
│ ├── api-spec/ # OpenAPI specification + code generation (Orval)
│ ├── api-zod/ # Generated Zod schemas and types from OpenAPI
│ ├── api-client-react/ # TanStack Query client for the API
│ └── db/ # Drizzle schema + PostgreSQL connection
├── scripts/ # Utility scripts
├── pnpm-workspace.yaml
└── package.json

text

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** (required — installation with npm/yarn is blocked by the `preinstall` script)
- A **PostgreSQL** database (local or hosted, e.g., Neon, Supabase, Railway…)

---

## Installation

```bash
git clone <repo-url>
cd lush-main
pnpm install
Environment Variables
artifacts/api-server
Variable	Description	Required
PORT	Port for the Express server	✅
DATABASE_URL	PostgreSQL connection URL	✅
SESSION_SECRET	Admin password, compared with the x-admin-password header for write routes (PUT /content, PUT /images/:key)	✅
lib/db
Variable	Description
DATABASE_URL	PostgreSQL connection URL used by Drizzle Kit (push)
Create a .env file in each relevant package with these values (not versioned).

Development
Start the API locally:

bash
cd artifacts/api-server
pnpm dev
Start the front‑end locally:

bash
cd artifacts/lush-boutique
pnpm dev
Database
The schema is defined with Drizzle ORM in lib/db/src/schema/site-content.ts and includes two tables:

site_content: textual content, key/value bilingual (value_en, value_ar)

site_images: site images stored as data URL, indexed by key

Push the schema to the database:

bash
cd lib/db
pnpm push          # applies migrations
pnpm push-force    # forces application (⚠️ may cause data loss)
API Endpoints
Base URL (production): https://lush-api-server.vercel.app/api

Method	Route	Description	Auth
GET	/healthz	Health check	No
GET	/content	Retrieve all site content and images	No
PUT	/content	Create or update a content entry (key, valueEn, valueAr)	Admin
GET	/images/:key	Retrieve an image by key	No
PUT	/images/:key	Create or update an image (dataUrl)	Admin
Protected routes require the x-admin-password header matching the SESSION_SECRET environment variable.

The full OpenAPI specification is available in lib/api-spec/openapi.yaml.

Build & Typecheck
From the monorepo root:

bash
pnpm run typecheck   # checks all packages (libs + artifacts)
pnpm run build       # typecheck + build all packages
Deployment
The API (artifacts/api-server) is deployed on Vercel:

🔗 https://lush-api-server.vercel.app

Production build of the API runs via:

bash
cd artifacts/api-server
pnpm build   # generates dist/index.mjs via esbuild
pnpm start    # starts the Node server in production
