const apiRouter = require('express').Router();
const { endpointsJSON } = require('../controllers/endpoints.controllers');
const categoriesRouter = require('./categoriesRouter');
const eventsRouter = require('./eventsRouter');
const eventTicketsRouter = require('./eventTicketsRouter');
const ordersRouter = require('./ordersRouter');
const ticketsRouter = require('./ticketsRouter');
const usersRouter = require('./usersRouter');

apiRouter.use('/events', eventsRouter)
apiRouter.use('/categories', categoriesRouter)
apiRouter.use('/tickets', ticketsRouter)
apiRouter.use('/event-tickets', eventTicketsRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/orders', ordersRouter)
apiRouter.get('/', endpointsJSON)

module.exports = apiRouter