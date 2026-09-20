FROM oven/bun:1.3.14 AS bun
FROM node:22-bookworm-slim

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# Use the same origin for the backend; do not embed localhost or a server IP in browser code.
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build && chown -R node:node .next

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["bun", "run", "start", "--hostname", "0.0.0.0", "--port", "3000"]
