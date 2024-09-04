const apiRouter = require('express').Router();
const eventsRouter = require('./eventsRouter');

apiRouter.use('/events', eventsRouter)

module.exports = apiRouter