const request = require('supertest')
const app = require('../../../../../app')
const { MissingParams, WrongOptionalParams } = require('../../../../utils/response');
const { version } = require('../../../../router');
const missingParams = new MissingParams();
const wrongOptionalParams = new WrongOptionalParams();

module.exports = () => describe('POST create User', () => {
    it('it should fail with 400 if email is missing', (done) => {
        const body = {
            password: '123',
            firstName: 'firstName',
            lastName: 'lastName',
            type: 'type'
        }

        request(app)
            .post(`/${version}/users`)
            .send(body)
            .then((response) => {
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual(missingParams);
                done();
            });
    })

    it('it should fail with 400 if password is missing', (done) => {
        const body = {
            email: 'email@test.com',
            firstName: 'firstName',
            lastName: 'lastName',
            type: 'type'
        }

        request(app)
            .post(`/${version}/users`)
            .send(body)
            .then((response) => {
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual(missingParams);
                done();
            });
    })

    it('it should fail with 400 if firstName is missing', (done) => {
        const body = {
            email: 'email@test.com',
            password: '123',
            lastName: 'lastName',
            type: 'type'
        }

        request(app)
            .post(`/${version}/users`)
            .send(body)
            .then((response) => {
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual(missingParams);
                done();
            });
    })

    it('it should fail with 400 if lastName is missing', (done) => {
        const body = {
            email: 'email@test.com',
            password: '123',
            firstName: 'firstName',
            type: 'type'
        }

        request(app)
            .post(`/${version}/users`)
            .send(body)
            .then((response) => {
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual(missingParams);
                done();
            });
    })

    it('it should fail with 400 if type is missing', (done) => {
        const body = {
            email: 'email@test.com',
            password: '123',
            firstName: 'firstName',
            lastName: 'lastName'
        }

        request(app)
            .post(`/${version}/users`)
            .send(body)
            .then((response) => {
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual(missingParams);
                done();
            });
    })

    it('it should fail with 400 if optional parameter has wrong type', (done) => {
        const body = {
            email: 'email@test.com',
            password: '123',
            username: 'username',
            firstName: 'firstName',
            lastName: 'lastName',
            type: 'type',
            idLocation: '1'
        }

        request(app)
            .post(`/${version}/users`)
            .send(body)
            .then((response) => {
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual(wrongOptionalParams);
                done();
            });
    })

    it('it should pass with 200', (done) => {
        const randomNumber = Math.floor(Math.random() * Math.floor(1000));
        const body = {
            email: `silviagarcia${randomNumber}@test.com`,
            password: 'password',
            firstName: 'Silvia',
            lastName: 'Garcia',
            type: 'admin'
        }

        request(app)
            .post(`/${version}/users`)
            .send(body)
            .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.idUser).toBeDefined();
                done();
            });
    })
})