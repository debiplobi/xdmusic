# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Required for some native deps
RUN apk add --no-cache libc6-compat

# Install wrangler
RUN npm install -g wrangler

# Copy project
COPY . .

# Install deps
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Build
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Deploy to Cloudflare
CMD ["wrangler", "deploy"]
