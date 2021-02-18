const bcryptLib = require('bcryptjs');
const generator = require('generate-password');

class bcrypt {

  static async hashPass(pass) {
    const hashPass = bcryptLib.hashSync(pass, 10);

    return hashPass;
  };

  static async compareHashes(pass, hash) {
    const valid = bcryptLib.compareSync(pass, hash);

    return valid;
  };

  static generatePassword() {
    const password = generator.generate({
      length: 10,
      numbers: true
    });

    return password;
  };
};

module.exports = bcrypt;