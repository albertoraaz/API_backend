const userService = require('../services/user.service');
const tokenService = require('../services/token.service');
const { generateUuid } = require('../utils/uuid.utils');
const {
  MissingParams,
  UnknownException,
  WrongOptionalParams,
  ConflictException,
  UnauthorizedError,
  ResourceNotFound
} = require('../utils/response');

class userController {
  static async signUp(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const {
      email,
      password,
      username,
      firstName,
      lastName,
      type,
      profileDescription,
      profilePicture,
      idLocation,
      birthDate,
      cv,
      workingHours
    } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof firstName !== 'string' ||
      typeof type !== 'string' ||
      typeof lastName !== 'string'
    ) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing or wrong type'
      );
      return res.status(400).send(new MissingParams());
    }

    if (
      (profileDescription !== undefined &&
        typeof profileDescription !== 'string') ||
      (profilePicture !== undefined && typeof profilePicture !== 'string') ||
      (idLocation !== undefined && typeof idLocation !== 'number') ||
      (username !== undefined && typeof username !== 'string') ||
      (workingHours !== undefined && typeof workingHours !== 'object')
    ) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Wrong type of optional parameter'
      );
      return res.status(400).send(new WrongOptionalParams());
    }

    try {
      const result = await userService.signUp(
        email,
        password,
        username,
        firstName,
        lastName,
        profileDescription,
        profilePicture,
        idLocation,
        type,
        birthDate,
        cv,
        workingHours
      );

      const validationToken = await tokenService.createValidationToken(
        result.insertId
      );

      console.log('Call id: %s response: success', callId);
      return res.status(200).send({
        idUser: result.insertId,
        token: validationToken.token
      });
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      const status = error.status;
      const err = error.error;
      const errorMsg = error.errorMsg;
      if (status === undefined)
        return res.status(500).send(new UnknownException());
      if (status === 409)
        return res
          .status(status)
          .send(new ConflictException(status, err, errorMsg));
    }
  }

  static async login(req, res) {
    const callId = generateUuid();
    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const { password, email } = req.body;

    if (typeof password !== 'string' || typeof email !== 'string') {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing or wrong type'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      const result = await userService.login(email, password);

      console.log('Call id: %s response: success', callId);
      return res.status(200).send(result);
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      const status = error.status;
      const err = error.error;
      const errorMsg = error.errorMsg;

      if (status === undefined)
        return res.status(500).send(new UnknownException());
      if (status === 401)
        return res
          .status(status)
          .send(new UnauthorizedError(status, err, errorMsg));
      if (status === 404)
        return res
          .status(status)
          .send(new ResourceNotFound(status, err, errorMsg));
    }
  }

  static logout(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const token = req.headers['access-token'];

    try {
      userService.logout(token);
      console.log('Call id: %s response: success', callId);

      return res.status(200).send();
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));
      return res.status(500).send(new UnknownException());
    }
  }

  static async getSingleUser(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const { id, email } = req.query;

    if (!id && !email) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      const result = await userService.getSingleUser(id, email);
      console.log('Call id: %s response: success', callId);

      res.status(200).send(result[0]);
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      const status = error.status;
      const err = error.error;
      const errorMsg = error.errorMsg;

      if (status === undefined)
        return res.status(500).send(new UnknownException());
      if (status === 401)
        return res
          .status(401)
          .send(new UnauthorizedError(status, err, errorMsg));
      if (status === 404)
        return res
          .status(status)
          .send(new ResourceNotFound(status, err, errorMsg));
    }
  }

  static async getUsersList(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const { text, limit, page, sort } = req.query;

    if (isNaN(limit) || isNaN(page)) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing or wrong type'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      console.log('Call id: %s response: success', callId);

      const result = await userService.getUsersList(text, limit, page, sort);
      res.status(200).send(result);
    } catch (error) {
      console.log('Call id: %s error:%s', callId, error, JSON.stringify(error));

      return res.status(500).send(new UnknownException());
    }
  }

  static async getCandidatesList(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const { skills, idLocation } = req.query;

    if (!skills && !idLocation) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      const result = await userService.getCandidatesList(skills, idLocation);
      console.log('Call id: %s response: success', callId);
      res.status(200).send(result);
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      return res.status(500).send(new UnknownException());
    }
  }

  static async userExists(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const { email } = req.query;

    if (!email) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      console.log('Call id: %s response: success', callId);

      const result = await userService.userExists(email);
      return res.status(200).send({ exists: result });
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      return res.status(500).send(new UnknownException());
    }
  }

  static async validateUser(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);
    const { token } = req.body;

    if (!token) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      console.log('Call id: %s response: success', callId);

      await userService.validateUser(token);
      return res.status(200).send();
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      const status = error.status;
      const err = error.error;
      const errorMsg = error.errorMsg;

      if (status === undefined)
        return res.status(500).send(new UnknownException());
      if (status === 401)
        return res
          .status(status)
          .send(new UnauthorizedError(status, err, errorMsg));
      if (status === 404)
        return res
          .status(status)
          .send(new ResourceNotFound(status, err, errorMsg));
    }
  }

  static async update(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const {
      username,
      firstName,
      lastName,
      profileDescription,
      profilePicture,
      idLocation,
      birthDate,
      cv,
      workingHours
    } = req.body;
    const { id } = req.params;
    const token = req.headers['access-token'];

    if (
      typeof username !== 'string' &&
      typeof firstName !== 'string' &&
      typeof lastName !== 'string' &&
      typeof profileDescription !== 'string' &&
      typeof profilePicture !== 'string' &&
      typeof idLocation !== 'number' &&
      typeof birthDate !== 'string' &&
      typeof cv !== 'object' &&
      typeof workingHours !== 'object'
    ) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing or wrong type'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      console.log('Call id: %s response: success', callId);

      await userService.update(
        username,
        firstName,
        lastName,
        profileDescription,
        profilePicture,
        idLocation,
        token,
        id,
        birthDate,
        cv,
        workingHours
      );

      return res.status(200).send(UnauthorizedError);
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      const status = error.status;
      const err = error.error;
      const errorMsg = error.errorMsg;

      if (status === undefined)
        return res.status(500).send(new UnknownException());
      if (status === 401)
        return res
          .status(status)
          .send(new UnauthorizedError(status, err, errorMsg));
      if (status === 404)
        return res
          .status(status)
          .send(new ResourceNotFound(status, err, errorMsg));
    }
  }

  static async updatePassword(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;
    const token = req.headers['access-token'];

    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing or wrong type'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      await userService.updatePassword(currentPassword, newPassword, token, id);
      return res.status(200).send();
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      const status = error.status;
      const err = error.error;
      const errorMsg = error.errorMsg;

      if (status === undefined)
        return res.status(500).send(new UnknownException());
      if (status === 401)
        return res
          .status(status)
          .send(new UnauthorizedError(status, err, errorMsg));
      if (status === 404)
        return res
          .status(status)
          .send(new ResourceNotFound(status, err, errorMsg));
      if (status === 409)
        return res
          .status(status)
          .send(new ConflictException(status, err, errorMsg));
    }
  }

  static async forgotPassword(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const { email } = req.body;

    if (typeof email !== 'string') {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing or wrong type'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      await userService.forgotPassword(email);
      return res.status(200).send();
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      const status = error.status;
      const err = error.error;
      const errorMsg = error.errorMsg;

      if (status === undefined)
        return res.status(500).send(new UnknownException());
      if (status === 404)
        return res
          .status(status)
          .send(new ResourceNotFound(status, err, errorMsg));
      if (status === 409)
        return res
          .status(status)
          .send(new ConflictException(status, err, errorMsg));
    }
  }

  static async validateForgotPassword(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);
    const { token, password } = req.body;

    if (!token || !password) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      console.log('Call id: %s response: success', callId);

      await userService.validateForgotPassword(token, password);
      return res.status(200).send();
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      const status = error.status;
      const err = error.error;
      const errorMsg = error.errorMsg;

      if (status === undefined)
        return res.status(500).send(new UnknownException());
      if (status === 401)
        return res
          .status(status)
          .send(new UnauthorizedError(status, err, errorMsg));
      if (status === 404)
        return res
          .status(status)
          .send(new ResourceNotFound(status, err, errorMsg));
    }
  }

  static async addSkillToCandidate(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const { id, idSkill } = req.params;
    const { idUser } = req.user.role;
    const { level } = req.body;

    if (!level) {
      console.log(
        'Call id: %s error:%s',
        callId,
        'Required parameter is missing'
      );
      return res.status(400).send(new MissingParams());
    }

    try {
      await userService.addSkillToCandidate(id, idSkill, level, idUser);

      console.log('Call id: %s response: success', callId);

      return res.status(200).send();
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      const status = error.status;
      const err = error.error;
      const errorMsg = error.errorMsg;

      if (status === undefined)
        return res.status(500).send(new UnknownException());
      if (status === 401)
        return res
          .status(status)
          .send(new UnauthorizedError(status, err, errorMsg));
      if (status === 404)
        return res
          .status(status)
          .send(new ResourceNotFound(status, err, errorMsg));
      if (status === 409)
        return res
          .status(status)
          .send(new ConflictException(status, err, errorMsg));
    }
  }

  static async removeSkillFromCandidate(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const { id, idSkill } = req.params;
    const { idUser } = req.user.role;

    try {
      await userService.removeSkillFromCandidate(id, idSkill, idUser);

      console.log('Call id: %s response: success', callId);

      return res.status(200).send();
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      const status = error.status;
      const err = error.error;
      const errorMsg = error.errorMsg;

      if (status === undefined)
        return res.status(500).send(new UnknownException());
      if (status === 401)
        return res
          .status(status)
          .send(new UnauthorizedError(status, err, errorMsg));
      if (status === 404)
        return res
          .status(status)
          .send(new ResourceNotFound(status, err, errorMsg));
      if (status === 409)
        return res
          .status(status)
          .send(new ConflictException(status, err, errorMsg));
    }
  }

  static async getCandidateSkills(req, res) {
    const callId = generateUuid();

    console.log('Call %s %s id: %s', req.method, req.url, callId);

    const { id } = req.params;

    try {
      const result = await userService.getCandidateSkills(id);
      console.log('Call id: %s response: success', callId);
      res.status(200).send(result);
    } catch (error) {
      console.log('Call id: %s error:%s', callId, JSON.stringify(error));

      return res.status(500).send(new UnknownException());
    }
  }
}
module.exports = userController;
