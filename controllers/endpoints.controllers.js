const { endpointsConvert } = require("../models/eventpoints.models")


exports.endpointsJSON = async (req, res, next) => {
  try{
    const endpoints = await endpointsConvert()
    res.status(200).send({endpoints})
  }
  catch(err) {
    next(err)
  }
}