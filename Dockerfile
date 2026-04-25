FROM node:20-alpine AS base

RUN apk add --no-cache python3 make g++

WORKDIR /code

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build && yarn install --frozen-lockfile --production=true

# Production stage
FROM node:20-alpine AS production

WORKDIR /code

COPY --from=base /code/package.json ./
COPY --from=base /code/node_modules ./node_modules
COPY --from=base /code/.next ./.next
COPY --from=base /code/next.config.js ./

EXPOSE 6000
CMD ["yarn", "start"]
