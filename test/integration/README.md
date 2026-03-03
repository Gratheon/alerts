# Integration Tests

## Overview

This directory contains integration tests for API behavior and cross-channel reliability.

**For manual channel tests** (email, SMS, Telegram) that require credentials, see `test/manual-tests/README.md`.

---

## Test Coverage

The integration tests in this directory cover:

### API Integration
- ✅ GraphQL API endpoints
- ✅ Database queries and mutations

### Cross-Channel Tests
- ✅ Verify failures in one channel don't affect others
- ✅ Verify all modules return status (not throw exceptions)

### Configuration Tests
- ✅ Verify AWS SES configuration structure
- ✅ Verify Twilio configuration structure
- ✅ Verify Telegram configuration structure

## Running the Tests

### Run Full Integration Tests (Local)

```bash
npm run test:integration
```

Or with justfile:

```bash
just test-integration
```

This suite starts Docker test dependencies and runs integration tests against the local API.

### Run CI Integration Tests

```bash
npm run test:integration:ci
```

Or with justfile:

```bash
just test-integration-ci
```

CI integration uses the CI-safe test list.

---

## Manual Channel Tests

For tests that require AWS SES, Twilio, and Telegram credentials or local-only end-to-end delivery validation, see:
- **Directory:** `test/manual-tests/`
- **README:** `test/manual-tests/README.md`

Those tests must be run manually in local or production environments.

## Resources

- **Alerts Service README:** `../../README.md`
- **Manual Tests:** `../manual-tests/README.md`
- **Email Module:** `../../src/delivery/email.ts`
- **SMS Module:** `../../src/delivery/sms.ts`
- **Telegram Module:** `../../src/delivery/telegram.ts`

---

**Last Updated:** January 2026
