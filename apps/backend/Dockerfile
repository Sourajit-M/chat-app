FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config files
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy package.json files for dependency resolution
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

# Build TypeScript → outputs to apps/backend/dist/
RUN cd apps/backend && pnpm build

# ← This is the fix: correct path to compiled entry point
CMD ["node", "apps/backend/dist/index.js"]