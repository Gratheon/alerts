FROM platformatic/node-caged:26-slim

WORKDIR /app

COPY . /app/

RUN npm install
RUN npm run build

EXPOSE 4560
