const tokenDao = require('../dao/token.dao');
const { UnauthorizedError } = require('../utils/response');

const tokenValidation = async (req, res, next) => {
  const browserToken = req.headers['access-token'];

  if (!browserToken) {
    next();
    return;
  }
  const result = await tokenDao.getToken(browserToken);
  const savedToken = result[0];

  if (result.length === 0) return res.status(401).send(new UnauthorizedError());
  const currentDateInMs = new Date().getTime();
  const createdAtInMs = savedToken.createdAt.getTime();

  if (parseInt(currentDateInMs) - parseInt(createdAtInMs) > savedToken.ttl) {
    return res.status(401).send(new UnauthorizedError());
  } else {
    const type =
      savedToken.tokenType === 'user' ? savedToken.type : savedToken.tokenType;

    const idUser = savedToken.idUser;

    req.user = { role: { type, idUser } };
  }
  next();
};

module.exports = tokenValidation;
