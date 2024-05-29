FROM node:20-alpine3.18 AS base

###################
# DEPS
###################
FROM base AS deps

# Create app directory
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

###################
# LOCAL DEVELOPMENT
###################
FROM deps AS dev

WORKDIR /app
COPY  . .

CMD \
  if [ -f yarn.lock ]; then yarn develop; \
  elif [ -f package-lock.json ]; then npm run develop; \
  elif [ -f pnpm-lock.yaml ]; then pnpm develop; \
  fi


###################
# BUILD
###################
FROM deps AS build

ENV NODE_ENV=production
WORKDIR /app

COPY . .
RUN npm run build

###################
# PRODUCTION
###################
FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app
COPY --from=build /app .

ENV PATH /app/node_modules/.bin:$PATH
EXPOSE 8000

CMD ["npm", "run", "start"]