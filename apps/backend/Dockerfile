FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy package files for all packages
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

# Build TypeScript
RUN cd apps/backend && pnpm build

WORKDIR /app/apps/backend

EXPOSE 5001

CMD ["node", "dist/index.js"]