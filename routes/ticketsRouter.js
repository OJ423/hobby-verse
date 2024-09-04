const { getAllTickets, getTicket, postTicket, patchTicket, deleteTicket } = require('../controllers/tickets_controllers')
const { authMiddleware } = require('../middlewares/authMiddleware')

const ticketsRouter = require('express').Router()

ticketsRouter.get('/', authMiddleware, getAllTickets)
ticketsRouter.get('/:ticketId', getTicket)

// Tickets CRUD operations

ticketsRouter.post('/new', authMiddleware, postTicket)
ticketsRouter.patch('/edit/:ticketId', authMiddleware, patchTicket)
ticketsRouter.delete('/delete/:ticketId', authMiddleware, deleteTicket)

module.exports = ticketsRouter