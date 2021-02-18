const {query, escapeId} = require('../repositories/main.repository');

class userDao {
  static signUp(user) {
    const insertUserQuery = `INSERT INTO User (email, passwordEncrypted,
        username, firstName, lastName, state, profileDescription,
        profilePicture, idLocation, type, birthDate, cv, workingHours) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_FORMAT(?, "%Y-%m-%d %T"), ?, ?)`;

    return query(insertUserQuery, user);
  }

  static validateUser(idUser) {
    const sql = `UPDATE User SET state = 'active' WHERE id = ?`;

    return query(sql, [idUser]);
  }

  static exists(value, field) {
    const sql = `SELECT COUNT(*) AS 'exists' FROM User WHERE ${field} = ?`;

    return query(sql, [value]);
  }

  static update(
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
  ) {
    let filters = '';
    const queryParams = [];
    let fields = 0;

    if (username) {
      filters += `username = ?`;
      queryParams.push(username);

      fields++;
    }

    if (firstName) {
      if (fields > 0) filters += `,`;

      filters += `firstName = ?`;
      queryParams.push(firstName);

      fields++;
    }
    if (lastName) {
      if (fields > 0) filters += `,`;

      filters += `lastName = ?`;
      queryParams.push(lastName);

      fields++;
    }
    if (profileDescription) {
      if (fields > 0) filters += `,`;

      filters += `profileDescription = ?`;
      queryParams.push(profileDescription);

      fields++;
    }
    if (profilePicture) {
      if (fields > 0) filters += `,`;

      filters += `profilePicture = ?`;
      queryParams.push(profilePicture);

      fields++;
    }
    if (idLocation) {
      if (fields > 0) filters += `,`;

      filters += `idLocation = ?`;
      queryParams.push(idLocation);

      fields++;
    }
    if (birthDate) {
      if (fields > 0) filters += `,`;

      filters += `birthDate = DATE_FORMAT(?, "%Y-%m-%d %T")`;
      queryParams.push(birthDate);

      fields++;
    }
    if (cv) {
      if (fields > 0) filters += `,`;

      filters += `cv = ?`;
      queryParams.push(JSON.stringify(cv));

      fields++;
    }

    if (workingHours) {
      if (fields > 0) filters += `,`;

      filters += `workingHours = ?`;
      queryParams.push(JSON.stringify(workingHours));

      fields++;
    }

    let sql = `UPDATE User SET ${filters} WHERE id = ?`;

    queryParams.push(id);

    return query(sql, queryParams);
  }

  static updatePassword(password, id) {
    const sql = `UPDATE User Set passwordEncrypted = ? WHERE id = ?`;

    return query(sql, [password, id]);
  }

  static async getId(email) {
    const sql = `SELECT u.id FROM User u WHERE email = ? limit 1`;

    return query(sql, [email]);
  }

  static getUserForAuth(value, field) {
    const sql = `SELECT u.passwordEncrypted, u.id, u.state FROM User u WHERE ${field} = ?`;

    return query(sql, [value]);
  }

  static getSingleUser(value, field) {
    const sql = `SELECT id, username, email, firstName, lastName, type, profileDescription, 
      profilePicture, idLocation, DATE_FORMAT(birthDate, "%Y-%m-%d %T") as birthDate, cv FROM User u WHERE ${field} = ?`;

    return query(sql, [value]);
  }

  static getUsersList(text, limit, from, columnToSort, typeOfSort) {
    let sql = `SELECT id, username, email, firstName, lastName, type, profilePicture, idLocation,
      DATE_FORMAT(birthDate, "%Y-%m-%d %T") as birthDate
      FROM User WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?`;
    let queryParams = [];
    queryParams.push(text, text, text);

    if (columnToSort && typeOfSort) {
      sql += ' ORDER BY ' + escapeId(columnToSort);
      sql += ` ${typeOfSort}`;
    } else {
      sql += ' ORDER BY id ASC';
    }

    if (parseInt(limit) >= 0 && parseInt(from) >= 0) {
      sql += ' LIMIT ?, ?';
      queryParams.push(parseInt(from), parseInt(limit));
    }

    return query(sql, queryParams);
  }

  static saveResetPassword(id, password) {
    const sql = `UPDATE User Set passwordEncrypted = ? WHERE id = ?`;

    return query(sql, [password, id]);
  }
}

module.exports = userDao;
