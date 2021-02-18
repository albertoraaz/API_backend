const AWS = require('aws-sdk');
const app = require('../app');
const { config } = require('./config');
const PORT_NUMBER = 3000;

const credentials = {};

if (config.env === 'local') {
  credentials.apiVersion = '2006-03-01';
  credentials.endpoint = 'http://localstack:4572/';
  //credentials.s3ForcePathStyle = true;
}

AWS.config.s3 = credentials;

app.use((req, res) => {
  res.status(404);
  res.send({ error: 'not Found - error 404' });
});

app.listen(PORT_NUMBER, () => {
  console.info(`Server listening @ http://localhost:${PORT_NUMBER}`);
});
