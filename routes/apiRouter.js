const apiRouter = require('express').Router();
const categoriesRouter = require('./categoriesRouter');
const eventsRouter = require('./eventsRouter');

apiRouter.use('/events', eventsRouter)
apiRouter.use('/categories', categoriesRouter)

module.exports = apiRouter