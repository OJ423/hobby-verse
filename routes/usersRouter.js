const { registerUser, verifyUser, loginUserByEmail, forgotPasswordRequest, updateUserPassword, patchUser, deleteUser } = require('../controllers/users_controllers')
const { authUserCrudOps } = require('../middlewares/authCrudOps')
const { authMiddleware } = require('../middlewares/authMiddleware')

const usersRouter = require('express').Router()

// Registration Process
usersRouter.post('/register', registerUser)
usersRouter.get('/verify-email', verifyUser)

// Login
usersRouter.post('/login', loginUserByEmail)

// Forgot Password Process
usersRouter.post('/forgot-password', forgotPasswordRequest)
usersRouter.post('/update-password', updateUserPassword)

// Patch User
usersRouter.patch('/edit/:id', authMiddleware, authUserCrudOps, patchUser)

// Delte User
usersRouter.delete('/delete/:id', authMiddleware, authUserCrudOps, deleteUser)

module.exports = usersRouter;