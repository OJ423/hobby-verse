const { postEventTickets, patchEventTickets, deleteEventTickets } = require('../controllers/event_tickets.controllers')
const { authMiddleware } = require('../middlewares/authMiddleware')

const eventTicketsRouter = require('express').Router()

// ADD EVENT TICKETS
eventTicketsRouter.post('/new', authMiddleware, postEventTickets)
eventTicketsRouter.patch('/edit/:eventTicketsId', authMiddleware, patchEventTickets)
eventTicketsRouter.delete('/delete/:eventTicketsId', authMiddleware, deleteEventTickets)

module.exports = eventTicketsRouter