const request = require('supertest');
const app = require('../../../../../app');
const { version } = require('../../../../router');
const {
  MissingParams,
  ResourceNotFound
} = require('../../../../utils/response');

const resourceNotFound = new ResourceNotFound();
const missingParams = new MissingParams();

module.exports = () =>
  describe('PUT update /v1/users/:id', () => {
    it('should fail with 400 if parameter has wrong type', done => {
      const loginCredentials = { email: 'user@mail.com', password: 'password' };
      let token;

      request(app)
        .post(`/${version}/users/login`)
        .send(loginCredentials)
        .then(response => {
          token = response.body.token;

          request(app)
            .put(`/${version}/users/1`)
            .set('access-token', token)
            .send({ firstName: 1 })
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
            .put(`/${version}/users/10000`)
            .set('access-token', token)
            .send({ firstName: 'name' })
            .then(response => {
              expect(response.statusCode).toBe(404);
              expect(response.body).toEqual(
                new ResourceNotFound(404,'not_found_resource', 'Usuario no encontrado')
              );
              done();
            });
        });
    });

    it('should succeed with 200 and update user', done => {
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
                    .put(`/${version}/users/${id}`)
                    .set('access-token', token)
                    .send({ firstName: 'name' })
                    .then(response => {
                      expect(response.statusCode).toBe(200);
                      done();
                    });
                });
            });
        });
    });
  });
