const tokenDao = require('../dao/token.dao');
const jwt = require('jsonwebtoken');
const { privateKey, ttl, shortTTL } = require('../config').tokenConfig;

class tokenService {
  static async createUserToken(id) {
    const expiration = Math.round(new Date().getTime() / 1000 + ttl);
    const tokenData = { id, expiration };

    const generatedToken = await jwt.sign(tokenData, privateKey);

    await tokenDao.deleteTokenByidUser(id);

    try {
      await tokenDao.insertToken(generatedToken, id, ttl, 'user');
    } catch (error) {
      console.log('token error: ', error);
    }

    return { token: generatedToken, idUser: id };
  }

  static async createValidationToken(id) {
    const expiration = Math.round(new Date().getTime() / 1000 + shortTTL);
    const tokenData = { id, expiration };

    const generatedToken = await jwt.sign(tokenData, privateKey);

    await tokenDao.deleteTokenByidUser(id);
    await tokenDao.insertToken(generatedToken, id, shortTTL, 'validation');

    return { token: generatedToken, idUser: id };
  }

  static async createResetPasswdToken(id) {
    const expiration = Math.round(new Date().getTime() / 1000 + shortTTL);
    const tokenData = { id, expiration };

    const generatedToken = await jwt.sign(tokenData, privateKey);

    await tokenDao.deleteTokenByidUser(id);
    await tokenDao.insertToken(generatedToken, id, shortTTL, 'reset');

    return { token: generatedToken, idUser: id };
  }

  static async removeToken(token) {
    return tokenDao.deleteToken(token);
  }
}

module.exports = tokenService;
