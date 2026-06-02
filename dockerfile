
#build for frontend 
FROM node:22-alpine

WORKDIR /app

COPY frontend/RT-CODE/package*.json ./

RUN npm install

COPY frontend/RT-CODE .

RUN npm run build

EXPOSE 5173

CMD ["npm","run","dev","--","--host"]

#build for backend
FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install

COPY backend .

EXPOSE 3000

CMD ["node","server.js"]