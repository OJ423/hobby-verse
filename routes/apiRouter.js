const apiRouter = require('express').Router();

const placeHolder =  async (req, res, next) => {
  try {
    res.status(200).send({msg:"hello world"})
  }
  catch {
    next
  }
}

apiRouter.use('/', placeHolder)