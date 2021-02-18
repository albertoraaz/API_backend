const userController = require('./user.controller');
const userService = require('../services/user.service.js');
const {
  MissingParams,
  WrongOptionalParams,
  UnauthorizedError,
} = require('../utils/response');

jest.mock('../services/user.service.js');
jest.mock('../services/token.service.js');

let sendMock;
let statusMock;
let res;

beforeEach(() => {
  sendMock = jest.fn();
  statusMock = jest.fn();
  res = {status: statusMock, send: sendMock};
  statusMock.mockImplementation(() => res);
});

describe('user Controller', () => {
  describe('sign up method', () => {
    it('should fail with 400 if email is missing', async () => {
      const req = {
        body: {
          password: '123',
          firstName: 'firstName',
          lastName: 'lastName',
          type: 'type',
        },
      };

      await userController.signUp(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should fail with 400 if password is missing', async () => {
      const req = {
        body: {
          email: 'email@test.com',
          firstName: 'firstName',
          lastName: 'lastName',
          type: 'type',
        },
      };

      await userController.signUp(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should fail with 400 if firstName is missing', async () => {
      const req = {
        body: {
          email: 'email@test.com',
          password: 'password',
          lastName: 'lastName',
          type: 'type',
        },
      };

      await userController.signUp(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should fail with 400 if lastName is missing', async () => {
      const req = {
        body: {
          email: 'email@test.com',
          password: 'password',
          firstName: 'firstName',
          type: 'type',
        },
      };

      await userController.signUp(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should fail with 400 if type is missing', async () => {
      const req = {
        body: {
          email: 'email@test.com',
          password: 'password',
          firstName: 'firstName',
          lastName: 'lastName',
        },
      };

      await userController.signUp(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should fail with 400 if optional parameter is sent with wrong type', async () => {
      const req = {
        body: {
          email: 'email@test.com',
          password: 'password',
          firstName: 'firstName',
          lastName: 'lastName',
          type: 'type',
          profilePicture: 123,
        },
      };

      await userController.signUp(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new WrongOptionalParams())
      );
    });
  });

  describe('login method', () => {
    it('should fail with 400 if no password is sent', async () => {
      const req = {body: {email: 'email@test.com'}};

      await userController.login(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should fail with 400 if no email is sent', async () => {
      const req = {body: {password: 'password'}};

      await userController.login(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should fail with 401 if credentials are incorrect', async () => {
      const req = {body: {email: 'email@test.com', password: 'password'}};

      userService.login.mockImplementationOnce(() => {
        throw {status: 401};
      });

      await userController.login(req, res);
      expect(statusMock).toBeCalledWith(401);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new UnauthorizedError())
      );
    });
    it('should pass with 200 and return token if all required parameters are sent', async () => {
      const req = {body: {email: 'email@test.com', password: 'password'}};
      const mock = 'tokenMock';

      userService.login.mockImplementationOnce(() => mock);
      await userController.login(req, res);
      expect(statusMock).toBeCalledWith(200);
    });
  });

  describe('logout method', () => {
    it('should pass with 200', async () => {
      const req = {headers: {'access-token': 'tokenMock'}};
      const mock = {};

      userService.logout.mockImplementationOnce(() => mock);

      await userController.logout(req, res);
      expect(statusMock).toBeCalledWith(200);
    });
  });

  describe('get single user', () => {
    it('should fail with 400 if both parameters are missing', async () => {
      const req = {query: {}, user: {role: 'recruiter', idUser: 2}};

      await userController.getSingleUser(req, res);
      expect(statusMock).toBeCalledWith(400);
    });
    it('should pass with 200 if id is sent', async () => {
      const req = {
        query: {id: '1'},
        user: {role: {idUser: 2, role: 'recruiter'}},
      };
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
          idLocation: null,
        },
      ];

      const result = {
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
        idLocation: null,
      };

      userService.getSingleUser.mockImplementationOnce(() => mock);

      await userController.getSingleUser(req, res);
      expect(statusMock).toBeCalledWith(200);
      expect(sendMock).toBeCalledWith(expect.objectContaining(result));
    });
    it('should pass with 200 if email is sent', async () => {
      const req = {
        query: {email: 'user2@mail.com'},
        user: {role: {idUser: 2, role: 'recruiter'}},
      };
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
          idLocation: null,
        },
      ];

      const result = {
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
        idLocation: null,
      };

      userService.getSingleUser.mockImplementationOnce(() => mock);

      await userController.getSingleUser(req, res);
      expect(statusMock).toBeCalledWith(200);
      expect(sendMock).toBeCalledWith(expect.objectContaining(result));
    });
  });

  describe('Get User List', () => {
    it('should fail with 400 if parameters are missing', async () => {
      const req = {query: {}};

      await userController.getUsersList(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });

    it('should pass with 200 if parameters are sent', async () => {
      const req = {query: {text: '@', limit: 10, page: 1}};
      const result = [
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
          idLocation: null,
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
          idLocation: null,
        },
      ];

      userService.getUsersList.mockImplementationOnce(() => result);

      await userController.getUsersList(req, res);
      expect(statusMock).toBeCalledWith(200);
      expect(sendMock).toBeCalledWith(expect.objectContaining(result));
    });
  });

  describe('User exists', () => {
    it('should fail with 400 if email is missing', async () => {
      const req = {query: {}};

      await userController.userExists(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should pass with 200 and return false if user does not exist', async () => {
      const req = {query: {email: 'test@email.com'}};
      const mock = false;
      const result = {exists: false};

      userService.userExists.mockImplementationOnce(() => mock);

      await userController.userExists(req, res);
      expect(statusMock).toBeCalledWith(200);
      expect(sendMock).toBeCalledWith(expect.objectContaining(result));
    });
    it('should pass with 200 and return true if user exists', async () => {
      const req = {query: {email: 'test@email.com'}};
      const mock = true;
      const result = {exists: true};

      userService.userExists.mockImplementationOnce(() => mock);

      await userController.userExists(req, res);
      expect(statusMock).toBeCalledWith(200);
      expect(sendMock).toBeCalledWith(expect.objectContaining(result));
    });
  });

  describe('User validation', () => {
    it('should fail with 400 if token is missing', async () => {
      const req = {body: {}};

      await userController.validateUser(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should fail with 401 if token does not exist in database', async () => {
      const req = {body: {token: 'token'}};

      userService.validateUser.mockImplementationOnce(() => {
        throw {status: 401};
      });

      await userController.validateUser(req, res);
      expect(statusMock).toBeCalledWith(401);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new UnauthorizedError())
      );
    });
    it('should pass with 200', async () => {
      const req = {body: {token: 'token'}};

      await userController.validateUser(req, res);
      expect(statusMock).toBeCalledWith(200);
    });
  });

  describe('User - update info', () => {
    it('should fail with 400 if parameter is sent with wrong type', async () => {
      const req = {
        body: {firstName: 1},
        params: {id: 1},
        headers: {['access-token']: 'token'},
      };

      await userController.update(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should pass with 200 and update user', async () => {
      const req = {
        body: {firstName: 'name'},
        params: {id: 1},
        headers: {['access-token']: 'token'},
      };

      await userController.update(req, res);
      expect(statusMock).toBeCalledWith(200);
    });
  });

  describe('User - update password', () => {
    it('should fail with 400 if a parameter is missing', async () => {
      const req = {
        body: {currentPassword: 'pass'},
        params: {id: 1},
        headers: {['access-token']: 'token'},
      };

      await userController.updatePassword(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should fail with 400 if a parameter is sent with wrong type', async () => {
      const req = {
        body: {currentPassword: 1},
        params: {id: 1},
        headers: {['access-token']: 'token'},
      };

      await userController.updatePassword(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });
    it('should fail with 400 if a parameter is sent with wrong type', async () => {
      const req = {
        body: {currentPassword: 'password', newPassword: 'new'},
        params: {id: 1},
        headers: {['access-token']: 'token'},
      };

      await userController.updatePassword(req, res);
      expect(statusMock).toBeCalledWith(200);
    });
  });

  // forgot password
  describe('Forgot password - start process', () => {
    it('should fail with 400 if email doesnt exists', async () => {
      const req = {
        body: {},
      };

      await userController.forgotPassword(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });

    it('should pass with 200 and update user', async () => {
      const req = {
        body: {email: 'user@mail.com'},
      };

      const mock = 0;

      userService.forgotPassword.mockImplementationOnce(() => mock);

      await userController.forgotPassword(req, res);
      expect(statusMock).toBeCalledWith(200);
    });
  });

  // Forgot confirmation
  describe('Forgot password - confirmation', () => {
    it('should fail with 400 if token doesnt exists', async () => {
      const req = {
        body: {password: 'pass'},
      };

      await userController.validateForgotPassword(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });

    it('should fail with 400 if password doesnt exists', async () => {
      const req = {
        body: {token: 'token'},
      };

      await userController.validateForgotPassword(req, res);
      expect(statusMock).toBeCalledWith(400);
      expect(sendMock).toBeCalledWith(
        expect.objectContaining(new MissingParams())
      );
    });

    it('should pass with 200 and update user', async () => {
      const req = {
        body: {token: 'token', password: 'pass'},
      };

      const mock = 0;

      userService.validateForgotPassword.mockImplementationOnce(() => mock);

      await userController.validateForgotPassword(req, res);
      expect(statusMock).toBeCalledWith(200);
    });
  });
});
