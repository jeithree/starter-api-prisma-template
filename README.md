**Project Overview**

- **Name**: starter-api-template — a TypeScript Express API starter using Prisma, Redis, sessions, and OAuth helpers.

**Tech Stack**

- **Runtime**: Node.js + TypeScript
- **ORM**: Prisma
- **Cache / Sessions**: Redis
- **Auth**: Email/password + OAuth (Facebook, Google)
- **Uploads**: `public/uploads/avatars`

**Prerequisites**

- **Node.js**: 18+ recommended
- **MySQL** (or another database supported by Prisma) for `DATABASE_URL`
- **Redis** for sessions/cache
- **Git** (optional)

**Quick Start**

1. Copy example env file:

```
cp .env.example .env.local
```

2. Install dependencies:

```
npm install
```

3. Edit `.env.local` and set required variables (see next section). The dev server reads `.env.local`; production uses `.env`.

4. Prepare the database and Prisma:

```
npx prisma generate
npx prisma migrate dev --name init
```

5. Start in development:

```
npm run dev
```

Or start using the production env:

```
npm start
```

**Environment Variables**

Copy ` .env.example` and set values for the variables. Important vars used in `src/configs/basic.ts` include:

- **NODE_ENV**: `development` or `production`.
- **PORT**: server port.
- **API_URL**, **SITE_URL**, **SITE_NAME**: application URLs and site name.
- **SESSION_SECRET**, **SESSION_PREFIX**: session configuration.
- **BCRYPT_SALT_ROUNDS**: bcrypt cost factor.
- **REDIS_HOST**, **REDIS_PORT**, **REDIS_PASSWORD**: Redis connection.
- **SMTP_HOST**, **SMTP_USER**, **SMTP_PASS**: email sending.
- **ADMIN_USERNAME**, **ADMIN_EMAIL**, **ADMIN_PASSWORD**: initial admin account.
- **FB\_\*** and **GOOGLE\_\***: OAuth client ids/secrets and endpoints.
- **DATABASE_URL**: Prisma DB connection string (see `prisma/schema.prisma`).

There is a `.env.example` file with full examples — start from that.

**Prisma & Database**

- Schema: `prisma/schema.prisma` (uses `env("DATABASE_URL")`).
- Run migrations with:

```
npx prisma migrate dev
```

- Generate Prisma client:

```
npx prisma generate
```

**Scripts** (from `package.json`)

- **`npm run dev`**: run development server (`node --watch --env-file=.env.local src/server.ts`).
- **`npm start`**: run server with `.env` file.
- **`npm test`**: run tests (Vitest).

**Uploads & Static Files**

- Avatars and uploads are stored in `public/uploads/avatars`. Ensure this directory is writable.

**Logging & Errors**

- Logs are under `logs/` for `error.txt` and `info.txt`.

**Useful Files**

- `src/configs/basic.ts` — main runtime configuration and required env variables.
- `prisma/schema.prisma` — database schema and datasource.
- `.env.example` — example environment file.
