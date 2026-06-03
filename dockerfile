FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/RT-CODE/package*.json ./
RUN npm ci

COPY frontend/RT-CODE/ ./
RUN npm run build

FROM node:22-alpine AS backend-runtime

WORKDIR /app/backend

RUN apk add --no-cache python3 openjdk17-jdk \
  && ln -sf /usr/bin/python3 /usr/local/bin/python

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist/ ./public/

ENV NODE_ENV=production
ENV PORT=1234

EXPOSE 1234

CMD ["node", "server.js"]
