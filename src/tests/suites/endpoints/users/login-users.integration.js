const request = require('supertest');
const app = require('../../../../../app');
const { version } = require('../../../../router');
const { Success, UnauthorizedError } = require('../../../../utils/response');

const unauthorizedError = new UnauthorizedError();
const success = new Success();

module.exports = () =>
  describe('POST /v1/users/login', () => {
    it('should fail with 404 if user dont exist', done => {
      const loginCredentials = {
        email: 'doesnot@exist.com',
        password: 'password'
      };

      request(app)
        .post(`/${version}/users/login`)
        .send(loginCredentials)
        .then(response => {
          expect(response.statusCode).toBe(404);
          done();
        });
    });

    it('should fail with 401 if passwords do not match', done => {
      const loginCredentials = {
        email: 'user@mail.com',
        password: 'wrongpass'
      };

      request(app)
        .post(`/${version}/users/login`)
        .send(loginCredentials)
        .then(response => {
          expect(response.statusCode).toBe(401);
          expect(response.body).toEqual(unauthorizedError);
          done();
        });
    });

    it('should fail with 401 if user state is pending', done => {
      const randomNumber = Math.floor(Math.random() * Math.floor(1000));
      const loginCredentials = {
        email: `${randomNumber}test@test.com`,
        password: 'password'
      };
      const body = {
        email: `${randomNumber}test@test.com`,
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
        type: 'admin'
      };

      request(app)
        .post('/v1/users')
        .send(body)
        .then(response => {
          request(app)
            .post(`/${version}/users/login`)
            .send(loginCredentials)
            .then(response => {
              expect(response.statusCode).toBe(401);
              expect(response.body).toEqual(
                new UnauthorizedError(
                  401,
                  'unauthorized',
                  'Usuario pendiente de validación'
                )
              );
              done();
            });
        });
    });

    it('should pass with 200 if state is active', done => {
      const loginCredentials = { email: 'user@mail.com', password: 'password' };

      request(app)
        .post(`/${version}/users/login`)
        .send(loginCredentials)
        .then(response => {
          expect(response.statusCode).toBe(200);
          done();
        });
    });
  });
