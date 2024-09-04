const { getAllCategories, getCategory, postCategory, patchCategory, deleteCategory } = require('../controllers/categories_controllers')
const { authMiddleware } = require('../middlewares/authMiddleware')
const categoriesRouter = require('express').Router()

// GET CATEGORIES
categoriesRouter.get('/', getAllCategories)
categoriesRouter.get('/:categoryId', getCategory)

// CRUD OPERATIONS
categoriesRouter.post('/new', authMiddleware, postCategory)
categoriesRouter.patch('/edit/:categoryId', authMiddleware, patchCategory)
categoriesRouter.delete('/delete/:categoryId', authMiddleware, deleteCategory)

module.exports = categoriesRouter