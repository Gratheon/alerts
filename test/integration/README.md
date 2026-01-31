# Integration Tests

## Overview

This directory contains automated integration tests that can run in CI/CD environments without requiring external service credentials.

**For manual channel tests** (email, SMS, Telegram) that require credentials, see `test/manual-tests/README.md`.

---

## Test Coverage

The integration tests in this directory cover:

### API Integration
- ✅ GraphQL API endpoints
- ✅ Database queries and mutations

### End-to-End Alert Delivery
- ✅ Full alert creation and delivery workflow
- ✅ Multi-channel coordination
- ✅ Delivery status tracking

### Cross-Channel Tests
- ✅ Verify failures in one channel don't affect others
- ✅ Verify all modules return status (not throw exceptions)

### Configuration Tests
- ✅ Verify AWS SES configuration structure
- ✅ Verify Twilio configuration structure
- ✅ Verify Telegram configuration structure

## Running the Tests

### Run All Integration Tests

```bash
npm run test:integration
```

Or with justfile:

```bash
just test-integration
```

These tests can run in CI/CD environments and do not require external service credentials.

---

## Manual Channel Tests

For tests that require AWS SES, Twilio, and Telegram credentials, see:
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
