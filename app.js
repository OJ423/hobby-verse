const express = require("express")
const apiRouter = require('./routes/apiRouter')
const {applicationErrors, customErrors, psqlErrors} = require("./errors/error_handling")
const cors = require('cors');
const FRONTEND_URL = process.env.FRONTEND_URL;

const app = express()
app.use(cors(({
  origin: FRONTEND_URL
})));
app.use(express.json())

app.use('/api', apiRouter)

app.use(customErrors)
app.use(psqlErrors)
app.use(applicationErrors)

module.exports = app