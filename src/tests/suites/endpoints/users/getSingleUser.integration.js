const request = require('supertest');
const app = require('../../../../../app');
const { version } = require('../../../../router');


module.exports = () => describe('get single user /v1/users?', () => {
  it('should fail with 400 both params are missing', (done) => {
    const randomNumber = Math.floor(Math.random() * Math.floor(1000));
    const loginCredentials = { email: 'user@mail.com', password: 'password' };
    let token;

    request(app)
      .post(`/${version}/users/login`)
      .send(loginCredentials)
      .then((response) => {
        token = response.body.token;
        idUser = response.body.idUser;

        request(app)
          .get(`/v1/users?`)
          .set('access-token', token)
          .then((response) => {
            expect(response.statusCode).toBe(400);
            done();
          });
      });
  });
  it('should fail with 404 if the user is not found with both parameters', (done) => {
    const randomNumber = Math.floor(Math.random() * Math.floor(1000));
    const loginCredentials = { email: 'user@mail.com', password: 'password' };

    let token;
    request(app)
      .post(`/${version}/users/login`)
      .send(loginCredentials)
      .then((response) => {
        token = response.body.token;
        idUser = response.body.idUser;

        request(app)
          .get(`/v1/users?email=invalidmail@test.com&id=100000`)
          .set('access-token', token)
          .then((response) => {
            expect(response.statusCode).toBe(404);
            done();
          });
      });
  });
  it('should fail with 404 if the user is not found with id', (done) => {
    const loginCredentials = { email: 'user@mail.com', password: 'password' };

    request(app)
      .post(`/${version}/users/login`)
      .send(loginCredentials)
      .then((response) => {
        token = response.body.token;
        idUser = response.body.idUser;

        request(app)
          .get(`/v1/users?id=100000`)
          .set('access-token', token)
          .then((response) => {
            expect(response.statusCode).toBe(404);
            done();

          });
      });
  });
  it('should fail with 404 if the user is not found with email', (done) => {
    const randomNumber = Math.floor(Math.random() * Math.floor(1000));
    const loginCredentials = { email: 'user@mail.com', password: 'password' };
    let token;

    request(app)
      .post(`/${version}/users/login`)
      .send(loginCredentials)
      .then((response) => {
        token = response.body.token;

        request(app)
          .get(`/v1/users?email=invalidmail@test.com`)
          .set('access-token', token)
          .then((response) => {
            expect(response.statusCode).toBe(404);
            done();

          });
      });
  });

  it('should pass with 200 and return user data if both parameters are sent', (done) => {
    const randomNumber = Math.floor(Math.random() * Math.floor(1000));
    const loginCredentials = { email: 'user@mail.com', password: 'password' };

    let token;

    request(app)
      .post(`/${version}/users/login`)
      .send(loginCredentials)
      .then((response) => {
        token = response.body.token;
        idUser = response.body.idUser;

        request(app)
          .get(`/v1/users?id=${idUser}&email=user${randomNumber}@test.com`)
          .set('access-token', token)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            done();

          });
      });
  });
  it('should pass with 200 and return user data if id is sent', (done) => {
    const loginCredentials = { email: 'user@mail.com', password: 'password' };

    let token;


    request(app)
      .post(`/${version}/users/login`)
      .send(loginCredentials)
      .then((response) => {
        token = response.body.token;
        idUser = response.body.idUser;

        request(app)
          .get(`/v1/users?id=1`)
          .set('access-token', token)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            done();

          });
      });
  });
  it('should pass with 200 and return user data if email is sent', (done) => {
    const randomNumber = Math.floor(Math.random() * Math.floor(1000));
    const loginCredentials = { email: 'user@mail.com', password: 'password' };

    let token;

    request(app)
      .post(`/${version}/users/login`)
      .send(loginCredentials)
      .then((response) => {
        token = response.body.token;
        idUser = response.body.idUser;

        request(app)
          .get(`/${version}/users?email=user@mail.com`)
          .set('access-token', token)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            done();

          });
      });
  });
});