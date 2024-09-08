const jwt = require("jsonwebtoken");
const { createNewUser, verifyNewUser, loginUserIn, verifyUserUpdatePassword, editUser, removeUser, addAdminStaff, fetchAdminStaff } = require("../models/users_models");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/user_emails");
const { checkUserForPasswordReset } = require("../utils/helper_functions");
const JWT_SECRET = process.env.JWT_SECRET;
const PASS_RESET = process.env.PASS_RESET;

exports.registerUser = async (req, res, next) => {
  try {
    const { body } = req;
    
    const newUser = await createNewUser(body)
    
    const verificationToken = await jwt.sign({ id: newUser.id, name: newUser.name }, JWT_SECRET, { expiresIn: '15m' });
    
    await sendVerificationEmail(newUser.email, verificationToken);
    
    res.status(201).send({ msg: 'User registered successfully. Please check your email to verify your account.' });
  } 
  catch(err) {
    next(err)
  };
};

exports.verifyUser = async (req, res, next) => {
  try {
    const { token } = req.query;
    
    const newUser = await verifyNewUser(token)
    
    const newToken = await jwt.sign({ id: newUser.id, name: newUser.name }, JWT_SECRET, { expiresIn: '15m' });
    
    res.status(200).send({msg:'Email verified successfully. Your account is now active.', user:newUser, token: newToken})
  
  }
  catch(err) {
    next(err)
  }
}

exports.loginUserByEmail = async (req, res, next) => {
  try {
    const { body } = req;
  
    const user = await loginUserIn(body)

    const token = await jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '15m' });

    res.status(200).send({ user, token });
  
  } catch(err) {
    next(err)
  };
};

exports.forgotPasswordRequest = async (req, res, next) => {
  try {
    const {body} = req
    await checkUserForPasswordReset(body)
    const verificationToken = await jwt.sign({ email: body.email }, process.env.PASS_RESET, { expiresIn: '51h' });
    await sendPasswordResetEmail(body.email, verificationToken)
    res.status(200).send({msg: 'Please check your email to change your password.'})
  }
  catch(err) {
    next(err)
  }
}

exports.updateUserPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { body } = req;
    const user = await verifyUserUpdatePassword(body, token)
    const newToken = await jwt.sign({ id: user.id, name: user. name }, JWT_SECRET, { expiresIn: '15m' });
    res.status(201).send({msg: 'You password has been changed successfully.', user, token: newToken})
  } 
  catch(err) {
    next(err)
  }
}

exports.patchUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const user = await editUser(id, body)
    const token = await jwt.sign({ id: user.id, name: user. name }, JWT_SECRET, { expiresIn: '15m' });
    res.status(200).send({ user, token })
  }
  catch(err) {
    next(err)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await removeUser(id)
    const token = await jwt.sign({ id: user.id, name: user. name }, JWT_SECRET, { expiresIn: '15m' });
    res.status(200).send({msg: 'User deleted.', user, token})
  }
  catch(err) {
    next(err)
  }
}

exports.patchAdminStaff = async (req, res, next) => {
  try {
    const { user, body } = req;
    const newRole = await addAdminStaff(user.id, body)
    const token = await jwt.sign({ id: user.id, name: user. name }, JWT_SECRET, { expiresIn: '15m' });

    res.status(200).send({msg: `${newRole.name} is now ${newRole.role}`, token})
  }
  catch(err) {
    next(err)
  }
}

exports.getAdminStaff = async (req, res, next) => {
  try {
    const { user } = req;
    const users = await fetchAdminStaff(user.id);
    const token = await jwt.sign({ id: user.id, name: user. name }, JWT_SECRET, { expiresIn: '15m' });
    res.status(200).send({users, token})
  }
  catch(err) {
    next(err)
  }
}
