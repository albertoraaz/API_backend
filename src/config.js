// Check for mandatory environment variables
const required = [
  'NODE_ENV',
  'DB_MAIN_HOST',
  'DB_MAIN_USER',
  'DB_MAIN_PASS',
  'DB_MAIN_NAME',
  'PRIVATE_KEY',
  'TTL',
  'SHORT_TTL'
];

required.forEach((param) => {
  if (!process.env[param]) {
    throw new Error(`Environment parameter ${param} is missing`);
  }
});

const config = {
  env: process.env['NODE_ENV'],
};

const tokenConfig = {
  privateKey: process.env['PRIVATE_KEY'],
  ttl: process.env['TTL'],
  shortTTL: process.env['SHORT_TTL'],
};

const mainDatabase = {
  host: process.env['DB_MAIN_HOST'],
  user: process.env['DB_MAIN_USER'],
  pass: process.env['DB_MAIN_PASS'],
  name: process.env['DB_MAIN_NAME'],
};

module.exports = {config, mainDatabase, tokenConfig};
