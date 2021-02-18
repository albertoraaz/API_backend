const request = require('supertest');
const app = require('../../../../../app');
const { version } = require('../../../../router');
const {
  Success,
  UnauthorizedError,
  MissingParams,
  ResourceNotFound
} = require('../../../../utils/response');

const resourceNotFound = new ResourceNotFound();
const missingParams = new MissingParams();
const unauthorizedError = new UnauthorizedError();
const success = new Success();

module.exports = () =>
  describe('PUT update password /v1/users/:id/password', () => {
    it('should fail with 400 if parameter has wrong type', done => {
      const loginCredentials = { email: 'user@mail.com', password: 'password' };
      let token;

      request(app)
        .post(`/${version}/users/login`)
        .send(loginCredentials)
        .then(response => {
          token = response.body.token;

          request(app)
            .put(`/${version}/users/1/password`)
            .set('access-token', token)
            .send({ currentPassword: 1, newPassword: 'pass' })
            .then(response => {
              expect(response.statusCode).toBe(400);
              expect(response.body).toEqual(missingParams);
              done();
            });
        });
    });

    it('should fail with 404 if user is not found', done => {
      const loginCredentials = { email: 'user@mail.com', password: 'password' };

      request(app)
        .post(`/${version}/users/login`)
        .send(loginCredentials)
        .then(response => {
          token = response.body.token;

          request(app)
            .put(`/${version}/users/10000/password`)
            .set('access-token', token)
            .send({ currentPassword: 'currentPassword', newPassword: 'pass' })
            .then(response => {
              expect(response.statusCode).toBe(404);
              expect(response.body).toEqual(
                new ResourceNotFound(
                  404,
                  'not_found_resource',
                  'Usuario no encontrado'
                )
              );
              done();
            });
        });
    });

    it('should succeed with 200 and update user password', done => {
      const randomNumber = Math.floor(Math.random() * Math.floor(1000));
      let id, token, validationToken;
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
        .post(`/${version}/users`)
        .send(body)
        .then(response => {
          id = response.body.idUser;
          validationToken = response.body.token;

          request(app)
            .post(`/${version}/users/validate`)
            .send({ token: validationToken })
            .then(response => {
              request(app)
                .post(`/${version}/users/login`)
                .send(loginCredentials)
                .then(response => {
                  token = response.body.token;
                  request(app)
                    .put(`/${version}/users/${id}/password`)
                    .set('access-token', token)
                    .send({ currentPassword: 'password', newPassword: 'pass' })
                    .then(response => {
                      expect(response.statusCode).toBe(200);
                      done();
                    });
                });
            });
        });
    });
  });
