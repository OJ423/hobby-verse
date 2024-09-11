const { db } = require('../db/connection')
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require('bcryptjs') 


// Registration Models
exports.createNewUser = async ({name, email, password}) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10)

    const {rows} = await db.query(`
        INSERT INTO users
        (name, email, password_hash, role)
        VALUES
        ($1, $2, $3, 'customer')
        RETURNING *`
      , [name, email, passwordHash ])

    return rows[0]
  }
  catch(err) {
    throw(err)
  }
}

exports.verifyNewUser = async (token) => {
  try {
    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return reject({ status: 400, msg: `Error verifying user: ${err}` });
        }
        resolve(decoded);
      });
    });

    const { rows } = await db.query(`
      UPDATE users SET verified = true WHERE id = $1
      RETURNING *`,
      [decodedToken.id]
    )
    
    return rows[0]
  } 
  catch(err) {
    throw err
  }
}

// Login

exports.loginUserIn = async ({email, password}) => {
  try {
    const { rows } = await db.query(`
      SELECT *
      FROM users
      WHERE email = $1
    `, [email])
   
    if (rows.length === 0) {
      return Promise.reject({ msg: "User not found", status: 404 });
    }
  
    const passwordCheck = await bcrypt.compare(password, rows[0].password_hash);
    
    if (passwordCheck) {
      return rows[0];
    } 
    else if (!passwordCheck) {
      return Promise.reject({ msg: "Passwords do not match. Please try again.", status: 400 });
    } 
  } 
  catch(err) {
    throw err
  }
}

// Forgot Password Verification

exports.verifyUserUpdatePassword = async ({ password }, token) => {
  try {
    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.PASS_RESET, (err, decodedToken) => {
        if (err) {
          return reject({status: 400, msg: `Error verifying user: ${err}`});
        }
        resolve(decodedToken);
      });
    })

    const hashedPassword = await bcrypt.hash(password,10)
    
    const { rows } = await db.query(`
        UPDATE users SET password_hash = $1 WHERE email = $2
        RETURNING *`,
        [hashedPassword, decodedToken.email]
      )
    return rows[0]
  }
  catch(err) {
    throw err
  }
} 

// Edit User

exports.editUser = async (id, {name = null, email = null}) => {
  try {
    const { rows } = await db.query(`
        UPDATE users
        SET
          name = COALESCE($2, name),
          email = COALESCE($3, email)
        WHERE id = $1
        RETURNING *;
      `, [id, name, email])

    if (!rows.length) {
      return Promise.reject({ msg: "Your token does not match", status: 401 })
    }
    return rows[0]
  }
  catch(err) {
    throw err
  }  
}

// DELETE USER

exports.removeUser = async (id) => {
  try {
    const { rows } = await db.query(`
      DELETE FROM users 
      WHERE id = $1
      RETURNING *`
      ,[id])
    
    return {msg: 'User deleted.', user:rows[0]}
  }
  catch(err) {
    throw err
  } 
}

// STAFF & ADMIN MANAGEMENT

exports.addAdminStaff = async ( userId, {email, role} ) => {
  try {
    // Admin request check
    const { rows: requester } = await db.query(`
      SELECT * FROM users
      WHERE id = $1`, [userId])

    if (!requester.length || (requester[0].role === "customer" || requester[0].role === "staff")) {
      return Promise.reject({msg: "You are not authorised to perform this action", status:401})
    }
    console.log(role)
    // Add admin/staff
  
    const { rows: newRole } = await db.query(`
      UPDATE users
      SET role = $1
      WHERE email = $2
      RETURNING *`, [role, email])
    
    if (!newRole.length) {
      return Promise.reject({msg: "No user found with this email address", status:404})
    }
  
    return newRole[0]
  }
  catch(err) {
    throw err
  }
}

exports.fetchAdminStaff = async ( userId ) => {
  try {
    // Admin request check
    const { rows: requester } = await db.query(`
      SELECT * FROM users
      WHERE id = $1`, [userId])

    if (!requester.length || (requester[0].role === "customer" || requester[0].role === "staff")) {
      return Promise.reject({msg: "You are not authorised to perform this action", status:401})
    }
  
    // Get admin/staff
  
    const { rows: users } = await db.query(`
      SELECT * FROM users
      WHERE role IN ('staff', 'admin');`)
    
    if (!users.length) {
      return Promise.reject({msg: "There are no staff and admin users", status:404})
    }
  
    return users
  }
  catch(err) {
    throw err
  }

}