const express = require("express")
// const apiRouter = require('./routes/apiRouter')
// const {applicationErrors, customErrors, psqlErrors} = require("./errors/errorHandling")
// const cors = require('cors');

const app = express()
// app.use(cors());
app.use(express.json())

app.use('/api', (req, res) => {
  res.send("hello world")
})

// app.use(customErrors)
// app.use(psqlErrors)
// app.use(applicationErrors)

module.exports = app