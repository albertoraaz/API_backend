const express = require('express');
const userController = require('./controllers/user.controller');
const router = express.Router();
const version = 'v1';

/* User */
router.post(`/${version}/users`, userController.signUp);
router.post(`/${version}/users/login`, userController.login);
router.post(`/${version}/users/logout`, userController.logout);
router.post(`/${version}/users/validate`, userController.validateUser);
router.post(`/${version}/users/reset`, userController.forgotPassword);
router.post(
  `/${version}/users/resetConfirm`,
  userController.validateForgotPassword
);
router.get(`/${version}/users/exists`, userController.userExists);
router.get(`/${version}/users/list`, userController.getUsersList);
router.get(`/${version}/users`, userController.getSingleUser);
router.put(`/${version}/users/:id`, userController.update);
router.put(`/${version}/users/:id/password`, userController.updatePassword);

module.exports = { router, version };
