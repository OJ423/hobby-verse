const { db } = require('../db/connection')

exports.checkUserForPasswordReset = async ({email}) => {
  const { rows } = await db.query(`
    SELECT email FROM users
    WHERE email = $1`
  ,[email])

  if (!rows.length) {
    return Promise.reject({status: 400, msg: 'Cannot find user email'})
  }

  return rows[0]
}