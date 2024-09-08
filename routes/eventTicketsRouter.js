const { postEventTickets, patchEventTickets, deleteEventTickets, getEventTickets } = require('../controllers/event_tickets.controllers')
const { authMiddleware } = require('../middlewares/authMiddleware')

const eventTicketsRouter = require('express').Router()

eventTicketsRouter.post('/new', authMiddleware, postEventTickets)
eventTicketsRouter.patch('/edit/:eventTicketsId', authMiddleware, patchEventTickets)
eventTicketsRouter.delete('/delete/:eventTicketsId', authMiddleware, deleteEventTickets)

// GET EVENT TICKETS AND TICKET DETAILS FOR EVENT
eventTicketsRouter.get('/:eventId', getEventTickets)


module.exports = eventTicketsRouter