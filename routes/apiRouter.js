const apiRouter = require('express').Router();
const categoriesRouter = require('./categoriesRouter');
const eventsRouter = require('./eventsRouter');
const eventTicketsRouter = require('./eventTicketsRouter');
const ticketsRouter = require('./ticketsRouter');
const usersRouter = require('./usersRouter');

apiRouter.use('/events', eventsRouter)
apiRouter.use('/categories', categoriesRouter)
apiRouter.use('/tickets', ticketsRouter)
apiRouter.use('/event-tickets', eventTicketsRouter)
apiRouter.use('/users', usersRouter)

module.exports = apiRouter