FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy prisma schemas
COPY libs/prisma/*/db/schema.prisma ./
# Copy only required prisma packages
COPY libs/prisma/lumina ./libs/prisma/lumina
COPY libs/prisma/lumina/db ./libs/prisma/lumina/db

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

COPY . .

# Generate Prisma clients
RUN pnpm nx prisma-generate prisma-lumina

# Build the API
RUN pnpm nx build api-lumina

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

# Copy built application
COPY --from=builder --chown=api:nodejs /app/dist/apps/api-lumina ./dist
COPY --from=builder --chown=api:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /app/libs/prisma/lumina ./libs/prisma/lumina

USER api

EXPOSE 4004

CMD ["node", "dist/main.js"]

