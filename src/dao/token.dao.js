const { query } = require('../repositories/main.repository');

class tokenDao {
  static getToken(token) {
    const sql = `
        select t.id, t.ttl, t.idUser, t.createdAt, u.username, u.type, t.type as tokenType
        from AccessToken t
        join User u on t.idUser=u.id
        where t.id = ?
        limit 1`;

    return query(sql, [token]);
  }

  static insertToken(token, idUser, ttl, type) {
    const sql = `INSERT INTO AccessToken (id, idUser, ttl, type)
    values (?, ?, ?, ?)`;

    return query(sql, [token, idUser, ttl, type])
  }

  static deleteTokenByidUser(idUser) {
    const sql = `DELETE FROM AccessToken WHERE idUser = ?`;
    
    return query(sql, [idUser]);
  }

  static deleteToken(token) {
    const sql = `DELETE FROM AccessToken WHERE id = ?`;

    return query(sql, [token])
  }
}

module.exports = tokenDao;