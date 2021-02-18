const userService = require('./user.service');
const tokenService = require('./token.service');
const userDao = require('../dao/user.dao.js');
const tokenDao = require('../dao/token.dao');
const bcrypt = require('../utils/bcrypt.util');

jest.mock('../dao/user.dao.js');
jest.mock('../utils/bcrypt.util');
jest.mock('../dao/token.dao.js');
jest.mock('./token.service');

describe('User Service', () => {
  describe('Sign up method', () => {
    it('should fail with 409 if email is already in use', async () => {
      const mock = [{ exists: 1 }];
      const resultError = {
        status: 409,
        error: 'email_in_use',
        errorMsg: 'Email en uso'
      };
      userDao.exists.mockImplementationOnce(() => mock);

      try {
        await userService.signUp();
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
  });

  describe('Create invited user method', () => {
    it('should fail with 409 if the user exists but types do not match', async () => {
      const mock = [{ id: 1, type: 'aspirant' }];
      const resultError = {
        status: 409,
        error: 'user_invalid_role',
        errorMsg: 'Usuario con rol incorrecto'
      };

      userDao.getSingleUser.mockImplementationOnce(() => mock);

      try {
        await userService.createInvitedUser('email@test.com', 'recruiter');
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
    it('should return idUser if email is in use and types are correct', async () => {
      const mock = [{ id: 1, type: 'recruiter' }];
      const resultId = { insertId: 1, state: 'active' };

      userDao.getSingleUser.mockImplementationOnce(() => mock);

      const result = await userService.createInvitedUser(
        'email@test.com',
        'recruiter'
      );

      expect(result).toEqual(resultId);
    });
  });

  describe('Login method', () => {
    it('should fail with 404 if the user dont exist', async () => {
      const mock = [];
      const resultError = {
        status: 404,
        error: 'user_not_found',
        errorMsg: 'Usuario no encontrado'
      };
      userDao.getUserForAuth.mockImplementationOnce(() => mock);

      try {
        await userService.login('email@test.com');
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
    it('should fail with 401 if user state is pending', async () => {
      const mock = [{ state: 'pending' }];
      const resultError = {
        status: 401,
        error: 'user_state_pending',
        errorMsg: 'Usuario pendiente de validación'
      };

      userDao.getUserForAuth.mockImplementationOnce(() => mock);

      try {
        await userService.login('email@test.com');
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
    it('should fail with 401 the passwords do not match', async () => {
      const mock1 = [{ state: 'active' }];
      const mock2 = false;
      const resultError = {
        status: 401,
        error: 'invalid_credentials',
        errorMsg: 'Credenciales inválidas para el recurso solicitado'
      };
      userDao.getUserForAuth.mockImplementationOnce(() => mock1);
      bcrypt.compareHashes.mockImplementationOnce(() => mock2);

      try {
        await userService.login('email@test.com');
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
  });

  describe('get single user', () => {
    it('should throw status 404 if no user is found', async () => {
      const mock = {};
      userDao.getSingleUser.mockImplementationOnce(() => mock);

      const result = await userService.getSingleUser();
      expect(result).toEqual(mock);
    });
    it('should return user data', async () => {
      const mock = [
        {
          id: '1',
          username: 'username',
          email: 'email@email.com',
          lastName: 'lastName',
          firstName: 'firstName',
          type: 'admin',
          createdAt: '2019-09-03T16:27:20.000Z',
          state: 'pending',
          profileDescription: null,
          profilePicture: null,
          idLocation: null
        }
      ];
      userDao.getSingleUser.mockImplementationOnce(() => mock);

      const result = await userService.getSingleUser();
      expect(result).toEqual(mock);
    });
  });

  describe('Get Users List', () => {
    it('should return empty array if no users are found', async () => {
      const mock = [];
      const result2 = { count: 0, results: mock };

      userDao.getUsersList.mockImplementationOnce(() => mock);
      userDao.getUsersList.mockImplementationOnce(() => mock);
      const result = await userService.getUsersList();
      expect(result).toEqual(result2);
    });
    it('should return array with the users found and count', async () => {
      const mock = [
        {
          id: '1',
          username: 'username',
          email: 'email@email.com',
          lastName: 'lastName',
          firstName: 'firstName',
          type: 'admin',
          createdAt: '2019-09-03T16:27:20.000Z',
          state: 'pending',
          profileDescription: null,
          profilePicture: null,
          idLocation: null
        },
        {
          id: '2',
          username: 'username',
          email: 'email@email.com',
          lastName: 'lastName',
          firstName: 'firstName',
          type: 'admin',
          createdAt: '2019-09-03T16:27:20.000Z',
          state: 'pending',
          profileDescription: null,
          profilePicture: null,
          idLocation: null
        }
      ];
      const result2 = {
        count: 2,
        results: mock
      };
      userDao.getUsersList.mockImplementationOnce(() => mock);
      userDao.getUsersList.mockImplementationOnce(() => mock);
      const result = await userService.getUsersList('text', 1, 1);
      expect(result).toEqual(result2);
    });
  });

  describe('Exists User in DB', () => {
    it('should return false if user does not exist', async () => {
      const mock = [{ exists: 0 }];
      userDao.exists.mockImplementationOnce(() => mock);

      const result = await userService.userExists();
      expect(result).toEqual(false);
    });
    it('should return true if user exists', async () => {
      const mock = [{ exists: 1 }];
      userDao.exists.mockImplementationOnce(() => mock);

      const result = await userService.userExists();
      expect(result).toEqual(true);
    });
  });

  describe('User Validation', () => {
    it('should throw status 401 if token is not found', async () => {
      const mock = [];
      const resultError = {
        status: 404,
        error: 'token_not_found',
        errorMsg: 'Token no encontrado'
      };
      tokenDao.getToken.mockImplementationOnce(() => mock);

      try {
        await userService.validateUser();
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });

    it('should throw status 401 if tokenType is expirated', async () => {
      const mock = [{ createdAt: new Date(2000, 1, 1), ttl: 1 }];
      const resultError = { status: 401 };

      tokenDao.getToken.mockImplementationOnce(() => mock);

      try {
        await userService.validateUser(1);
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
    it('should throw status 401 if tokenType is not for validation', async () => {
      const dateInFuture = new Date(2030, 1, 1);
      const mock = [{ createdAt: dateInFuture, tokenType: 'user', ttl: 1 }];
      const resultError = { status: 401 };

      tokenDao.getToken.mockImplementationOnce(() => mock);

      try {
        await userService.validateUser();
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
    it('should pass if token is not expired and tokenType is for validation', async () => {
      const dateInFuture = new Date(2030, 1, 1);
      const mock = [
        { createdAt: dateInFuture, tokenType: 'validation', ttl: 1 }
      ];

      tokenDao.getToken.mockImplementationOnce(() => mock);

      const result = await userService.validateUser();
      expect(result).toEqual(undefined);
    });
  });

  describe('Update user info method', () => {
    it('should fail with 404 if user is not found', async () => {
      const mock = [{ exists: 0 }];
      const resultError = {
        status: 404,
        error: 'user_not_found',
        errorMsg: 'Usuario no encontrado'
      };
      userDao.exists.mockImplementationOnce(() => mock);

      try {
        await userService.update();
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
    it('should fail with 401 if id user dont match', async () => {
      const mock = [{ exists: 1 }];
      const tokenMock = [{ idUser: 2 }];
      const resultError = {
        error: 'invalid_credentials',
        status: 401,
        errorMsg: 'Credenciales inválidas para el recurso solicitado'
      };

      userDao.exists.mockImplementationOnce(() => mock);
      tokenDao.getToken.mockImplementationOnce(() => tokenMock);

      try {
        await userService.update(
          'username',
          'firstName',
          'lastName',
          'profileDescription',
          'profilePicture',
          1,
          'token',
          1
        );
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
    it('should succeed with 200', async () => {
      const mock = [{ exists: 1 }];
      const tokenMock = [{ idUser: 1 }];

      userDao.exists.mockImplementationOnce(() => mock);
      tokenDao.getToken.mockImplementationOnce(() => tokenMock);
      userDao.update.mockImplementationOnce(() => 0);

      const result = await userService.update(
        'username',
        'firstName',
        'lastName',
        'profileDescription',
        'profilePicture',
        1,
        'token',
        1
      );
      expect(result).toEqual(0);
    });
  });

  describe('Update user password method', () => {
    it('should fail with 404 if user is not found', async () => {
      const mock = [];
      const resultError = {
        status: 404,
        error: 'user_not_found',
        errorMsg: 'Usuario no encontrado'
      };

      userDao.getUserForAuth.mockImplementationOnce(() => mock);

      try {
        await userService.updatePassword(
          'currentPassword',
          'newPassword',
          'token',
          1
        );
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
    it('should fail with 401 if id user dont match', async () => {
      const mock = [{ idUser: 1 }];
      const tokenMock = [{ idUser: 2 }];
      const resultError = {
        error: 'invalid_credentials',
        status: 401,
        errorMsg: 'Credenciales inválidas para el recurso solicitado'
      };

      userDao.getUserForAuth.mockImplementationOnce(() => mock);
      tokenDao.getToken.mockImplementationOnce(() => tokenMock);

      try {
        await userService.updatePassword(
          'currentPassword',
          'newPassword',
          'token',
          1
        );
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
    it('should fail with 401 if current password dont match', async () => {
      const mock = [{ idUser: 1 }];
      const tokenMock = [{ idUser: 1 }];
      const resultError = {
        error: 'invalid_credentials',
        status: 401,
        errorMsg: 'Credenciales inválidas para el recurso solicitado'
      };

      userDao.getUserForAuth.mockImplementationOnce(() => mock);
      tokenDao.getToken.mockImplementationOnce(() => tokenMock);
      bcrypt.compareHashes.mockImplementationOnce(() => {
        false;
      });

      try {
        await userService.updatePassword(
          'currentPassword',
          'newPassword',
          'token',
          1
        );
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
    it('should succeed with 200', async () => {
      const mock = [{ exists: 1 }];
      const tokenMock = [{ idUser: 1 }];

      userDao.getUserForAuth.mockImplementationOnce(() => mock);
      tokenDao.getToken.mockImplementationOnce(() => tokenMock);
      bcrypt.compareHashes.mockImplementationOnce(() => true);
      userDao.updatePassword.mockImplementationOnce(() => 0);

      const result = await userService.updatePassword(
        'currentPassword',
        'newPassword',
        'token',
        1
      );
      expect(result).toEqual(0);
    });
  });

  // Forgot password
  describe('Forgot password - start', () => {
    it('should throw status 404 if user not found', async () => {
      const mock = [];
      const resultError = {
        status: 404,
        error: 'user_not_found',
        errorMsg: 'Usuario no encontrado'
      };

      userDao.getId.mockImplementationOnce(() => mock);

      try {
        await userService.forgotPassword();
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
  });

  // Forgot password confirmation
  describe('Forgot password - confirmation', () => {
    it('should throw status 404 if token not found', async () => {
      const mock = [];
      const resultError = {
        status: 404,
        error: 'token_not_found',
        errorMsg: 'Token no encontrado'
      };

      tokenDao.getToken.mockImplementationOnce(() => mock);

      try {
        await userService.validateForgotPassword();
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });

    it('should pass', async () => {
      const mock = 1;
      const mockToken = [
        {
          token: 'token',
          createdAt: new Date(),
          ttl: 100000,
          idUser: 1,
          username: 'user',
          tokenType: 'reset'
        }
      ];

      tokenDao.getToken.mockImplementationOnce(() => mockToken);
      userDao.saveResetPassword.mockImplementationOnce(() => mock);

      try {
        await userService.validateForgotPassword();
      } catch (error) {
        expect(error).toEqual(resultError);
      }
    });
  });
});
