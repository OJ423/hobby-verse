const { postOrder, deleteOrderItem, deleteOrder, getOrders, getOrderByUser, getOrder } = require('../controllers/orders_controllers')
const { authMiddleware } = require('../middlewares/authMiddleware')

const ordersRouter = require('express').Router()

// Add order
ordersRouter.post('/new', authMiddleware, postOrder)

// Delete Order Item
ordersRouter.delete('/order-item/:orderItemId', authMiddleware, deleteOrderItem)

// Delete Order
ordersRouter.delete('/:orderId', authMiddleware, deleteOrder)

// Get Orders
ordersRouter.get('/', authMiddleware, getOrders)
ordersRouter.get('/user', authMiddleware, getOrderByUser)
ordersRouter.get('/:orderId', authMiddleware, getOrder)

module.exports = ordersRouter