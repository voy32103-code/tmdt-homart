# Agent Instructions

## Package Manager
Use **npm**:
- Backend: `npm install`, `npm start` (in `source/backend`)
- Frontend React: `npm install`, `npm run dev`, `npm run build` (in `source/frontend-react`)

## File-Scoped Commands
| Task | Command | Directory |
|------|---------|-----------|
| Frontend Lint | `npm run lint` | `source/frontend-react` |
| Frontend Build | `npm run build` | `source/frontend-react` |

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: Antigravity <antigravity@google.com>
```

## Upgrade Target Architecture
When executing the website upgrade, follow these guidelines:

### Backend (Express + Prisma + PostgreSQL)
- DB connection via database URL: `DATABASE_URL` in `.env`
- Use Prisma Client for queries. Do not write raw SQL.
- Model architecture: MVC structure under `source/backend`
- Node environment: CommonJS (`type: "commonjs"`)

### Frontend (React + Vite + TailwindCSS v4 + Zustand + React Router)
- Build tool: Vite
- CSS styling: TailwindCSS v4 via `@import "tailwindcss"` in `index.css`. No `tailwind.config.js` file.
- Routing: Single SPA using React Router DOM.
- State Management: Zustand for global stores (e.g., `cartStore`, `authStore`).
- Code style: ES Modules (`type: "module"`)

### General Rules
- Keep Vietnamese comments.
- Do not add placeholder files or code.
