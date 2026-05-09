# PPT AI

AI-powered presentation generator built with TanStack Start, React 19, Prisma, Better Auth, and Inngest.

Generate a deck from a text prompt, edit slide settings, regenerate content, preview slides, run slideshow mode, and export to .pptx.

## Features

- OAuth login (GitHub configured; Google button present in UI)
- Auth-protected app routes and server functions
- Prompt to multi-slide generation using Google models via AI SDK
- Presentation and slide persistence with Prisma + PostgreSQL
- Regenerate deck content asynchronously through Inngest events
- Slide preview, fullscreen, slideshow mode
- One-click PowerPoint export using PptxGenJS
- Modern UI with Tailwind CSS v4 and reusable UI components

## Tech Stack

- Framework: TanStack Start + TanStack Router
- Frontend: React 19, TypeScript, Tailwind CSS v4
- Data fetching/cache: TanStack Query
- Auth: Better Auth + Prisma adapter
- Database: PostgreSQL + Prisma ORM
- Background jobs/events: Inngest
- AI generation: AI SDK + Google provider
- Export: PptxGenJS

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ppt_ai"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"
IMAGEKIT_BASE_URL="https://ik.imagekit.io/your-path"

# Recommended by Better Auth in production
BETTER_AUTH_SECRET="replace-with-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Start development server

```bash
npm run dev
```

App runs on `http://localhost:3000`.

## Available Scripts

- `npm run dev`: start local dev server on port 3000
- `npm run build`: create production build
- `npm run preview`: preview production build
- `npm run test`: run Vitest tests
- `npm run lint`: run ESLint
- `npm run format`: format with Prettier and run ESLint autofix
- `npm run check`: run Prettier check

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| DATABASE_URL | Yes | PostgreSQL connection string for Prisma |
| GITHUB_CLIENT_ID | Yes (for GitHub login) | Better Auth GitHub provider client id |
| GITHUB_CLIENT_SECRET | Yes (for GitHub login) | Better Auth GitHub provider client secret |
| GOOGLE_GENERATIVE_AI_API_KEY | Yes (for AI generation) | Key used by `@ai-sdk/google` |
| IMAGEKIT_BASE_URL | Yes (for slide images) | Base URL used to build generated image links |
| BETTER_AUTH_SECRET | Strongly recommended | Better Auth signing secret |
| BETTER_AUTH_URL | Recommended | Canonical app URL for auth callbacks |

Notes:

- The client auth helper currently points to `http://localhost:3000` in `src/lib/auth-client.ts`. Update this when deploying.
- The login UI shows a Google button, but server-side social provider config currently includes GitHub only.

## Project Structure

```text
src/
  routes/                    # File-based routes (pages + API endpoints)
    __root.tsx               # Root shell, providers, global document
    index.tsx                # Prompt form + presentation list
    presentation.$presentation.tsx
    _auth/login.tsx
    api/auth/$.ts            # Better Auth handler route
    api/inngest.ts           # Inngest serve endpoint

  features/presentation/
    actions/                 # create/update/delete/regenerate server functions
    api/                     # presentation query server functions
    components/              # presentation UI pieces
    hooks/                   # feature hooks and query orchestration
    lib/export-pptx.ts       # PPTX export logic

  integrations/
    better-auth/
    inngest/
      client.ts
      functions.ts           # AI generation function definitions

  lib/
    auth.ts                  # Better Auth server config
    auth.function.ts         # session helper server functions
    db.ts                    # Prisma client singleton

prisma/
  schema.prisma
  migrations/
```

## Route Overview

- `/`: protected home page to create and list presentations
- `/presentation/$presentation`: protected detail page with edit/regenerate/export flows
- `/login`: OAuth sign-in page
- `/api/auth/$`: Better Auth API route
- `/api/inngest`: Inngest event/function endpoint

## How Generation Works

1. User submits prompt and settings from home page.
2. App creates a `presentation` row with `GENERATING` status.
3. App emits `presentation/generate` event through Inngest client.
4. Inngest function builds slide content with Google model.
5. Existing slides are replaced and new slides are persisted.
6. Presentation is marked `COMPLETED` and appears in UI.

## Prisma Models

Core models in `prisma/schema.prisma`:

- `User`, `Session`, `Account`, `Verification` for auth
- `Presentation` for deck metadata and generation state
- `Slide` for slide-level title/content/notes/image fields

## Deployment Notes

- Set all production environment variables, especially auth and database values.
- Replace local auth client base URL in `src/lib/auth-client.ts` with your deployed URL.
- Ensure your Inngest endpoint is reachable at `/api/inngest`.
- Ensure generated function(s) are registered in the Inngest serve handler.

## Troubleshooting

- Migration errors: verify `DATABASE_URL` and rerun `npx prisma migrate dev`.
- OAuth callback errors: check provider credentials and callback URL setup.
- AI generation failures: verify `GOOGLE_GENERATIVE_AI_API_KEY`.
- Missing slide images: verify `IMAGEKIT_BASE_URL` format and accessibility.
- Empty background processing: confirm Inngest functions are included in the `/api/inngest` handler.
