
#build for frontend 
FROM node:20-alphine as frontend-builder

COPY ./frontend /app 

WORKDIR /app

RUN npm install 

RUN npm run build 

#buold for backend
FROM node:20-alphine as backend-builder

COPY ./backend /app

WORKDIR /app 

RUN npm install 

COPY --from=frontend-builder /app/dist /app/public

CMD ["node" , "server.js"]