const request = require('supertest');
const app = require('../../../../../app');
const { MissingParams } = require('../../../../utils/response');

const missingParams = new MissingParams();

module.exports = () => describe('POST /v1/users/validate', () => {
  it('should fail with 400 if token is missing', (done) => {
    const body = {}
    request(app)
      .post('/v1/users/validate')
      .send(body)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(missingParams);
        done();
      });
  });
  it('should fail with 404 if token does not exist in database', (done) => {
    const body = { token: 'token' }
    request(app)
      .post('/v1/users/validate')
      .send(body)
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });
});