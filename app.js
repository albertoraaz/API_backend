const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const acl = require('express-acl');
const { router } = require('./src/router');
const { version } = require('./src/router');
const swaggerDocument = require('./src/swagger.json');
const tokenValidation = require('./src/middlewares/token.middleware');
const app = express();
const mainDBRepository = require('./src/repositories/main.repository');
const multer = require('multer');
const upload = multer();

mainDBRepository.connect();

app.mainDBRepository = mainDBRepository;

/* ACL config */
let configObject = {
  filename: 'nacl.json',
  baseUrl: version,
  roleSearchPath: 'user.role.type',
  defaultRole: 'guest'
};

let responseObject = {
  status: 'Access Denied',
  message: 'You are not authorized to access this resource'
};

acl.config(configObject, responseObject);

// Enable cors for public access
app.use(cors());

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).end();
});

// Serve swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// JSON parsing
app.use(bodyParser.json());

// Other request types parsing
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// Remove express header
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});

// tokenValidation middleware
app.use(tokenValidation);

/* ACL middleware */
app.use(acl.authorize);

// Parse multipart/form-data
app.use(upload.single('file'));

// API requests routing
app.use('/', router);

module.exports = app;
