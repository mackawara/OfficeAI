FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache git python3 make g++ redis

# Create and set working directory
WORKDIR /code

# Copy package files first for better caching
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build the project
RUN yarn build

# Production stage
FROM node:20-alpine AS production

# Install only production dependencies
RUN apk add --no-cache git python3 make g++ redis

WORKDIR /code

# Copy package files and install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

# Copy built application from base stage
COPY --from=base /code/.next ./.next
COPY --from=base /code/next.config.js ./
COPY --from=base /code/start.sh ./

# Set permissions
RUN chmod +x ./start.sh

EXPOSE 3000
CMD ["./start.sh"] 