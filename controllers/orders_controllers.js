const jwt = require("jsonwebtoken");
const { addOrder, removeOrderItem, removeOrder, fetchOrders, fetchOrderByUser, fetchOrder } = require("../models/orders_models");
const { orderConfirmationEmail } = require("../utils/user_emails");
const JWT_SECRET = process.env.JWT_SECRET;

exports.postOrder = async (req, res, next) => {
  try {
    const { user, body } = req;
    const order = await addOrder(user.id, body);
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    await orderConfirmationEmail(order)
    res.status(201).send({order, token})
  }
  catch(err) {
    next(err)
  }
}

exports.deleteOrderItem = async (req, res, next) => {
  try {
    const { orderItemId } = req.params;
    const { user } = req;
    const orderItem = await removeOrderItem(user.id, orderItemId)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({msg: "Order item deleted", orderItem:orderItem[0], newOrderTotal:orderItem[1],token})
  }
  catch(err) {
    next(err)
  }
}

exports.deleteOrder = async (req, res, next) => {
  try {
    const { user } = req;
    const { orderId } = req.params;
    const order = await removeOrder(user.id, orderId)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({msg: "Order deleted", order, token})
  }
  catch(err) {
    next(err)
  }
}

exports.getOrders = async (req, res, next) => {
  try {
    const { user } = req;
    const orders = await fetchOrders(user.id)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({orders, token})
  }
  catch(err) {
    next(err)
  }
}

exports.getOrderByUser = async (req, res, next) => {
  try {
    const { user } = req;
    const orders = await fetchOrderByUser(user.id);
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({orders, token})
  }
  catch(err) {
    next(err)
  }
}

exports.getOrder = async (req, res, next) => {
  try {
    const {user} = req;
    const { orderId } = req.params;
    const order = await fetchOrder(user.id, orderId)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({order: order, token})
  }
  catch(err) {
    next(err)
  }
}