cd /www/alerts/
COMPOSE_PROJECT_NAME=gratheon docker-compose -f docker-compose.prod.yml down
rm -rf ./app
COMPOSE_PROJECT_NAME=gratheon docker-compose -f docker-compose.prod.yml up --build -d