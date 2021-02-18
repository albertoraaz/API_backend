## Technologies/tools used
- node js
- express
- mysql
- docker
- docker-compose
- jest for unit testing
- SuperTest
- swagger

## Flow 

The flow of every packet received is:
- index: main class where the project is started
- app: set up port, healthcheck, routes, and aws endpoint for local testing
- router: where all the routes are defined, is used in app.js 
- controllers: to validate basic things needed
- services: concrete classes/services with some business logic (in this case very little)
- daos: where is the DB logic, on how to get the data and from where
- repositories: the final providers/connections, in this case the real call implementation to dynamodb

## Prerequisites

- Docker [https://www.docker.com/get-started]
- docker-compose


### start api locally

This service is the Node API for local development. To start the app and develop right away, needs to have DB project running as mysql container.

To do that go to database project and run:

```bash
docker-compose up mysql
```

Then on this project run:

```bash
docker-compose up local
```

The API will restart automatically every time a change is made. To make requests go to http://localhost:8080

### unit tests

This service runs unit tests. It also produces coverage reports. To run the unit tests:

```bash
docker-compose up test
```

### integration-test

This service runs integration tests. 
Needs to have DB project already running.

To run the integration tests:

```bash
docker-compose up integration-test
```

### Swagger
- This project implements a swagger ui. To view it just go to: http://localhost:8080/docs

Can be tested thru swagger

### Test Methods by CURL

## get dummy

curl -X GET \
  'http://localhost:3000/v1/dummy/sent?sender=user1' \
  -H 'Postman-Token: 49250d20-5287-4061-9c5c-3f47d7251b3b' \
  -H 'cache-control: no-cache'