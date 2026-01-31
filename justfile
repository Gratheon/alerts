start:
	mkdir -p tmp
	rm -rf ./app
	source $HOME/.nvm/nvm.sh && nvm install 20 && nvm use && npm i && npm run build
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.dev.yml up --build

stop:
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.dev.yml down

run:
	ENV_ID=dev npm run dev

# Run all tests (unit + integration)
test:
	npm test

# Run only unit tests
test-unit:
	npm run test:unit

# Run all integration tests
test-integration:
	npm run test:integration

# Run API integration tests
test-api:
	npm run test:integration:api

# Run delivery channel tests
test-delivery:
	npm run test:integration:delivery

# Run end-to-end alert delivery test
test-e2e:
	npm run test:integration:e2e

# Run specific channel tests
test-email:
	npm run test:integration:email

test-sms:
	npm run test:integration:sms

test-telegram:
	npm run test:integration:telegram

# Run tests in Docker
test-docker:
	npm run test:docker
