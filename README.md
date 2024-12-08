# alerts

Gratheon.com alerts service, responsible for:
- showing generated alerts in the UI (web-app)

TODO
- weather alerts reporting for a specific apiary
- alert channel configuration by the user
- SMS alerts
- email alerts


## URLs

| Environment | URL                             |
| ----------- | ------------------------------- |
| Local       | http://localhost:4560           |

## Development

To run, you need [nvm](https://github.com/nvm-sh/nvm) and [just](https://github.com/casey/just):

```
just start
```

### API

| Method | URL          | Description             |
| ------ | ------------ | ----------------------- |
| POST   | /graphql     | GraphQL API             |
| GET    | /health      | Health check            |

## Architecture

```mermaid
flowchart LR
    web-app("<a href='https://github.com/Gratheon/web-app'>web-app</a>") --"fetch user alerts"--> graphql-router --> alerts("<a href='https://github.com/Gratheon/alerts'>alerts</a>") --"read/write alerts"--> mysql
    alerts -."check weather at apiary coordinates".-> weather
    alerts --"fetch phone number for alerts"--> user-cycle
    alerts --"send SMS alerts"--> twilio
```
