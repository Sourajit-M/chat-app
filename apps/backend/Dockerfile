FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy package.json files for all workspaces
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

# Build TypeScript — run from backend dir so tsconfig.json is found
WORKDIR /app/apps/backend
RUN pnpm build

# Verify dist was created — this will fail the build loudly if dist is missing
RUN ls -la dist/ && ls -la dist/index.js

EXPOSE 5001

CMD ["node", "dist/index.js"]