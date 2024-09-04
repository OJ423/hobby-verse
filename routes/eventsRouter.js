const eventsRouter = require('express').Router()
const { getAllEvents, getEvent, postEvent, patchEvent, deleteEvent } = require('../controllers/events_controllers')
const { authMiddleware } = require('../middlewares/authMiddleware')


eventsRouter.get('/', getAllEvents)
eventsRouter.get('/:id', getEvent)

// CRUD OPERATIONS
eventsRouter.post('/new', authMiddleware, postEvent)
eventsRouter.patch('/edit/:eventId', authMiddleware, patchEvent)
eventsRouter.delete('/delete/:eventId', authMiddleware, deleteEvent)

module.exports = eventsRouter