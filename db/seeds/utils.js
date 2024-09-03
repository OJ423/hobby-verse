const bcrypt = require('bcryptjs') 

exports.hashPasswords = (password_hash) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password_hash, salt);
  return hash
}