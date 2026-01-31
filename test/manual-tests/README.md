# Manual Integration Tests

These tests require actual service credentials (AWS SES, Twilio, Telegram) and are intended to be run manually in local development or production environments only.

**These tests will NOT run in CI/CD** because they depend on credentials stored in `config.dev.ts` or `config.prod.ts` which are not committed to the repository.

## Tests in this directory:

- `email.test.ts` - AWS SES email delivery (requires AWS credentials)
- `sms.test.ts` - Twilio SMS delivery (requires Twilio credentials)  
- `telegram.test.ts` - Telegram Bot delivery (requires Telegram bot token)

## Running manual tests:

```bash
# Run all manual tests
npm run test:manual

# Or with justfile
just test-manual

# Run a specific test file
ENV_ID=dev npx jest test/manual-tests/email.test.ts
ENV_ID=dev npx jest test/manual-tests/sms.test.ts
ENV_ID=dev npx jest test/manual-tests/telegram.test.ts
```

## Required environment:

- `ENV_ID=dev` or `ENV_ID=prod` must be set
- Corresponding config file must exist with valid credentials
- For local testing: `src/config/config.dev.ts` (gitignored)
- For production: `src/config/config.prod.ts` (gitignored)

## Contact information used in tests:

- Email: artkurapov@gmail.com
- Phone: +37258058720
- Telegram chat ID: 374550738

Update these in the test files if you want to test with different contacts.
