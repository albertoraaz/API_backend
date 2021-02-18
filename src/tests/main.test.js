/* Users */
const createUsers = require('./suites/endpoints/users/create-users.integration');
const loginUser = require('./suites/endpoints/users/login-users.integration');
const getSingleUser = require('./suites/endpoints/users/getSingleUser.integration');
const logoutUser = require('./suites/endpoints/users/logout-users.integration');
const getUsersList = require('./suites/endpoints/users/getUsersList.integration');
const validateUsers = require('./suites/endpoints/users/validate-users.integration');
const updateUsers = require('./suites/endpoints/users/update-users.integration');
const updatePassword = require('./suites/endpoints/users/update-password.integration');

const app = require('../../app');

describe('Main', () => {
    afterAll(async () => {
        await app.mainDBRepository.disconnect();
    });

    /* Users */
    createUsers();
    loginUser();
    logoutUser();
    getSingleUser();
    getUsersList();
    validateUsers();
    updateUsers();
    updatePassword();

});
