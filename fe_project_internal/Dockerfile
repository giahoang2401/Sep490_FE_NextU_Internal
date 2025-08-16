FROM node:18-alpine AS base

FROM base AS depen
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=depen /app/node_modules ./node_modules
COPY . .

# Bien goi API BFF
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build 
RUN yarn build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3111

ENV PORT 3111
ENV HOSTNAME "0.0.0.0"

CMD ["yarn", "start"]