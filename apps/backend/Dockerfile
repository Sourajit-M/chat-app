FROM node:20-alpine

RUN npm install -g pnpm

# Set workdir to the monorepo root
WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy package.json files
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

# Build TypeScript
RUN cd apps/backend && pnpm build

# Verify the build output exists (helps debug if build fails silently)
RUN ls -la apps/backend/dist/

EXPOSE 5001

CMD ["node", "apps/backend/dist/index.js"]