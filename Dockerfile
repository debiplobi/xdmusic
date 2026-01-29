# syntax=docker.io/docker/dockerfile:1

FROM --platform=linux/amd64 node:20-alpine AS base

WORKDIR /app

# Needed for some native deps
RUN apk add --no-cache libc6-compat

# --------------------
# Dependencies
# --------------------
FROM base AS deps

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# --------------------
# Build
# --------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next telemetry (optional)
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# --------------------
# Deploy (final)
# --------------------
FROM base AS deploy

RUN npm install -g wrangler

COPY --from=builder /app ./

CMD ["wrangler", "deploy"]
