FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

FROM node:22-alpine

WORKDIR /app

RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

COPY --from=builder /app /app

# Ensure uploads dir exists and is owned by the app user
RUN mkdir -p uploads && chown -R nodeuser:nodegroup /app

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

USER nodeuser

CMD ["node", "server.js"]

