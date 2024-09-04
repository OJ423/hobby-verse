const apiRouter = require('express').Router();
const categoriesRouter = require('./categoriesRouter');
const eventsRouter = require('./eventsRouter');
const ticketsRouter = require('./ticketsRouter');

apiRouter.use('/events', eventsRouter)
apiRouter.use('/categories', categoriesRouter)
apiRouter.use('/tickets', ticketsRouter)

module.exports = apiRouter