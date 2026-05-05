# Stage 1: Build
FROM oven/bun:1 AS build
WORKDIR /app

ARG VITE_SIGNALR_HUB_URL=http://localhost:6100/notificaciones/hub
ARG VITE_AUTO_SAVE_INTERVAL_MS=10000
ARG VITE_WORKOS_CLIENT_ID=client_01KFH6W3J1RM7X9566904X2CZ3
ENV VITE_SIGNALR_HUB_URL=${VITE_SIGNALR_HUB_URL}
ENV VITE_AUTO_SAVE_INTERVAL_MS=${VITE_AUTO_SAVE_INTERVAL_MS}
ENV VITE_WORKOS_CLIENT_ID=${VITE_WORKOS_CLIENT_ID}

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: Serve static files
FROM oven/bun:1-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist

EXPOSE 80
CMD ["bun", "x", "serve", "dist", "-l", "80", "-s"]
