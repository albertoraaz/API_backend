const request = require('supertest');
const app = require('../../../../../app');
const { version } = require('../../../../router');

module.exports = () => describe('get /v1/users/list', () => {
  it('should fail with 400 if no query param is sent', (done) => {
    let token;
    const loginCredentials = { email: 'user@mail.com', password: 'password' };

    request(app)
      .post(`/${version}/users/login`)
      .send(loginCredentials)
      .then((response) => {
        token = response.body.token;

        request(app)
          .get('/v1/users/list?')
          .set('access-token', token)
          .then((response) => {
            expect(response.statusCode).toBe(400);
            done();

          });
      });
  });
  it('should pass with 200 and return array with Users List if all params are sent', (done) => {
    let token;
    const loginCredentials = { email: 'user@mail.com', password: 'password' };

    request(app)
      .post(`/${version}/users/login`)
      .send(loginCredentials)
      .then((response) => {
        token = response.body.token;

        request(app)
          .get('/v1/users/list?text=@&limit=1&page=1')
          .set('access-token', token)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
            done();
          });
      });
  });
});