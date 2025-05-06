FROM node:18

WORKDIR /app

COPY src/server/package*.json ./
RUN npm install

COPY src/server .

EXPOSE 3000

CMD ["node", "index.js"]