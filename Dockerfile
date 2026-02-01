FROM node:22-alpine

WORKDIR /app

COPY . /app/

RUN npm install
RUN npm run build

EXPOSE 4560
