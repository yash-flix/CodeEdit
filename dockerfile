FROM node:20-alpine 

COPY ./backend/package*.json ./

WORKDIR /app

RUN npm install

COPY ./backend ./

CMD ["node", "server.js"]