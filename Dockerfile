FROM node:20-alpine AS base

RUN apk add --no-cache git python3 make g++

WORKDIR /code

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

COPY . .

RUN yarn build

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache git python3 make g++

WORKDIR /code

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

COPY --from=base /code/.next ./.next
COPY --from=base /code/next.config.js ./
COPY --from=base /code/public ./public

EXPOSE 6000
CMD ["yarn", "start"]
