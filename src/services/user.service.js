const userDao = require('../dao/user.dao');
const tokenDao = require('../dao/token.dao');
const tokenService = require('./token.service');
const bcrypt = require('../utils/bcrypt.util');

class userService {
  static async signUp(
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
  ) {
    const state = 'pending';
    const result = await userDao.exists(email, 'email');
    const existsByEmail = result[0].exists;

    if (existsByEmail > 0)
      throw {status: 409, error: 'email_in_use', errorMsg: 'Email en uso'};

    const passwordEncrypted = await bcrypt.hashPass(password);

    const user = [
      email,
      passwordEncrypted,
      username,
      firstName,
      lastName,
      state,
      profileDescription,
      profilePicture,
      idLocation,
      type,
      birthDate,
      cv,
      workingHours,
    ];

    return userDao.signUp(user);
  }

  static async createInvitedUser(email, type) {
    const state = 'active';
    const result = await userDao.getSingleUser(email, 'email');
    const userExists = result[0];

    if (userExists && userExists.type !== type)
      throw {
        status: 409,
        error: 'user_invalid_role',
        errorMsg: 'Usuario con rol incorrecto',
      };

    if (userExists && userExists.type === type)
      return {insertId: userExists.id, state: 'active'};

    const password = await bcrypt.generatePassword();
    const passwordEncrypted = await bcrypt.hashPass(password);

    sendMail.invitedMail(email, password);

    const user = [
      email,
      passwordEncrypted,
      'default',
      'default',
      'default',
      state,
      null,
      null,
      null,
      type,
      null,
      null,
      null,
    ];

    return userDao.signUp(user);
  }

  static async login(email, password) {
    const existsUser = await userDao.getUserForAuth(email, 'email');
    if (existsUser.length === 0)
      throw {
        status: 404,
        error: 'user_not_found',
        errorMsg: 'Usuario no encontrado',
      };

    const userData = existsUser[0];

    if (userData.state !== 'active')
      throw {
        status: 401,
        error: 'user_state_pending',
        errorMsg: 'Usuario pendiente de validación',
      };

    const valid = await bcrypt.compareHashes(
      password,
      userData.passwordEncrypted
    );
    if (!valid)
      throw {
        status: 401,
        error: 'invalid_credentials',
        errorMsg: 'Credenciales inválidas para el recurso solicitado',
      };

    return tokenService.createUserToken(userData.id);
  }

  static logout(token) {
    return tokenService.removeToken(token);
  }

  static async getSingleUser(id, email) {
    let result;

    if (id) {
      result = await userDao.getSingleUser(id, 'id');
    } else result = await userDao.getSingleUser(email, 'email');

    if (result.length === 0)
      throw {
        status: 404,
        error: 'user_not_found',
        errorMsg: 'Usuario no encontrado',
      };
    return result;
  }

  static async getUsersList(text, limit, page, sort) {
    if (limit <= 0 || page <= 0)
      throw {
        status: 400,
        error: 'param_not_negative',
        errorMsg: 'El parámetro debe ser mayor o igual a 1',
      };

    let columnToSort, typeOfSort;

    if (sort) {
      const result = sort.split('.');
      if (result.length === 2) {
        columnToSort = result[0];
        typeOfSort = result[1];
        if (
          typeOfSort.toUpperCase() !== 'ASC' &&
          typeOfSort.toUpperCase() !== 'DESC'
        ) {
          typeOfSort = `ASC`;
        }
      }
    } else {
      columnToSort = `id`;
      typeOfSort = `ASC`;
    }

    if (
      typeOfSort.toUpperCase() !== 'ASC' &&
      typeOfSort.toUpperCase() !== 'DESC'
    ) {
      typeOfSort = 'ASC';
    }

    let from;

    if (parseInt(page) === 1) {
      from = 0;
    } else {
      from = limit * (page - 1);
    }

    const usersLists = await userDao.getUsersList(
      `%${text}%`,
      limit,
      from,
      columnToSort,
      typeOfSort
    );
    const usersCount = await userDao.getUsersList(
      `%${text}%`,
      null,
      null,
      columnToSort,
      typeOfSort
    );
    return {
      count: usersCount.length,
      results: usersLists,
    };
  }

  static async userExists(email) {
    const result = await userDao.exists(email, 'email');
    let boolean;

    result[0].exists === 0 ? (boolean = false) : (boolean = true);
    return boolean;
  }

  static async validateUser(token) {
    const result = await tokenDao.getToken(token);

    if (result.length === 0)
      throw {
        status: 404,
        error: 'token_not_found',
        errorMsg: 'Token no encontrado',
      };
    const savedToken = result[0];

    const currentDateInMs = new Date().getTime();
    const createdAtInMs = savedToken.createdAt.getTime();

    if (parseInt(currentDateInMs) - parseInt(createdAtInMs) > savedToken.ttl) {
      throw {status: 401};
    } else if (savedToken.tokenType !== 'validation') throw {status: 401};
    else {
      return userDao.validateUser(savedToken.idUser);
    }
  }

  static async update(
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
  ) {
    const exists = await userDao.exists(id, 'id');
    if (exists[0].exists === 0)
      throw {
        status: 404,
        error: 'user_not_found',
        errorMsg: 'Usuario no encontrado',
      };

    const userToken = await tokenDao.getToken(token);

    if (userToken[0].idUser !== parseInt(id))
      throw {
        status: 401,
        error: 'invalid_credentials',
        errorMsg: 'Credenciales inválidas para el recurso solicitado',
      };

    return userDao.update(
      id,
      username,
      firstName,
      lastName,
      profileDescription,
      profilePicture,
      idLocation,
      birthDate,
      cv,
      workingHours
    );
  }

  static async updatePassword(currentPassword, newPassword, token, id) {
    const userData = await userDao.getUserForAuth(id, 'id');
    if (userData.length === 0)
      throw {
        status: 404,
        error: 'user_not_found',
        errorMsg: 'Usuario no encontrado',
      };

    const userToken = await tokenDao.getToken(token);
    if (userToken[0].idUser !== parseInt(id))
      throw {
        status: 401,
        error: 'invalid_credentials',
        errorMsg: 'Credenciales inválidas para el recurso solicitado',
      };

    const valid = await bcrypt.compareHashes(
      currentPassword,
      userData[0].passwordEncrypted
    );
    if (!valid)
      throw {
        status: 401,
        error: 'invalid_credentials',
        errorMsg: 'Credenciales inválidas para el recurso solicitado',
      };

    const passwordEncrypted = await bcrypt.hashPass(newPassword);

    return userDao.updatePassword(passwordEncrypted, id);
  }

  static async forgotPassword(email) {
    const userRow = await userDao.getId(email);

    if (userRow.length > 0) {
      const idUser = userRow[0].id;
      const resetToken = await tokenService.createResetPasswdToken(idUser);

      await sendMail.resetPassMail(email, resetToken.token);

      return 0;
    } else {
      throw {
        status: 404,
        error: 'user_not_found',
        errorMsg: 'Usuario no encontrado',
      };
    }
  }

  static async validateForgotPassword(token, password) {
    const result = await tokenDao.getToken(token);

    if (result.length === 0)
      throw {
        status: 404,
        error: 'token_not_found',
        errorMsg: 'Token no encontrado',
      };
    const savedToken = result[0];

    const currentDateInMs = new Date().getTime();
    const createdAtInMs = savedToken.createdAt.getTime();

    if (parseInt(currentDateInMs) - parseInt(createdAtInMs) > savedToken.ttl) {
      console.log(
        'diff: ',
        parseInt(currentDateInMs) - parseInt(createdAtInMs)
      );
      console.log('ttl: ', savedToken.ttl);
      throw {status: 401};
    } else if (savedToken.tokenType !== 'reset') throw {status: 401};
    else {
      const passwordEncrypted = await bcrypt.hashPass(password);
      return userDao.saveResetPassword(savedToken.idUser, passwordEncrypted);
    }
  }
}

module.exports = userService;
