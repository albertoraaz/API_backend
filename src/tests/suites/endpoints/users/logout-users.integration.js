const request = require('supertest');
const app = require('../../../../../app');

module.exports = () => describe('POST /v1/users/logout', () => {

  it('should pass with 200', async (done) => {
    let token;
    const loginCredentials = { email: 'user@mail.com', password: 'password' };

    request(app)
      .post('/v1/users/login')
      .send(loginCredentials)
      .then((response) => {
        token = response.body.token;

        request(app)
          .post('/v1/users/logout')
          .set('access-token', token)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            done();

          });
      });
  });
});
