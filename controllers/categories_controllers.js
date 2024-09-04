const jwt = require("jsonwebtoken");
const { fetchAllCategories, fetchCategory, insertCategory, editCategory, removeCategory } = require("../models/categories_models");
const JWT_SECRET = process.env.JWT_SECRET;


exports.getAllCategories = async (req, res, next) => {
  try{
    const categories = await fetchAllCategories()
    res.status(200).send({categories})
  }
  catch(err) {
    next(err)
  }
}

exports.getCategory = async (req, res, next) => {
  try{
    const {categoryId} = req.params
    const category = await fetchCategory(categoryId)
    res.status(200).send({category})
  }
  catch(err) {
    next(err)
  }
}

exports.postCategory = async (req, res, next) => {
  try {
    const {user, body} = req
    const category = await insertCategory(user.id, body)
    res.status(201).send({category})
  }
  catch(err) {
    next(err)
  }
}

exports.patchCategory = async (req, res, next) => {
  try {
    const {user,body} = req;
    const {categoryId} = req.params;
    const category = await editCategory(user.id, categoryId, body)
    res.status(200).send({category})
  }
  catch(err) {
    next(err)
  }
}

exports.deleteCategory = async (req, res, next) => {
  try {
    const { user } = req;
    const { categoryId } = req.params;
    const category = await removeCategory(user.id, categoryId)
    res.status(200).send({msg: "Category deleted", category})
  }
  catch(err) {
    next(err)
  }
}