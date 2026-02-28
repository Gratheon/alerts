start:
	mkdir -p tmp
	rm -rf ./app
	source $HOME/.nvm/nvm.sh && nvm install 25 && nvm use && npm i && npm run build
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

# Run full integration tests (includes local-only e2e flow)
test-integration:
	npm run test:integration

# Run CI integration tests (excludes local-only e2e flow)
test-integration-ci:
	npm run test:integration:ci

# Run manual channel tests (email, SMS, Telegram - requires credentials)
test-manual:
	npm run test:manual

# Run tests in Docker
test-docker:
	npm run test:docker
