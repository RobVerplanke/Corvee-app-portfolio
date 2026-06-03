FROM node:22-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm install --build-from-source

COPY . .

EXPOSE 3000

CMD ["npm", "start"]