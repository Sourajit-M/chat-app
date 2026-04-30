FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config files from monorepo root
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy package.json files for workspace packages
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

# Change to backend directory for build
WORKDIR /app/apps/backend

# Build TypeScript
RUN pnpm build

# Verify build succeeded
RUN ls -la dist/index.js

EXPOSE 5001

CMD ["node", "dist/index.js"]