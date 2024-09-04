const jwt = require("jsonwebtoken");
const { fetchAllTickets, fetchTicket, insertTicket, editTicket, removeTicket } = require("../models/tickets_models");
const JWT_SECRET = process.env.JWT_SECRET;

exports.getAllTickets = async (req, res, next) => {
  try {
    const { user } = req;
    const tickets = await fetchAllTickets(user.id)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({tickets, token})
  }
  catch(err) {
    next(err)
  }
}

exports.getTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const ticket = await fetchTicket(ticketId)
    res.status(200).send({ticket})
  }
  catch(err) {
    next(err)
  }
}

exports.postTicket = async (req, res, next) => {
  try {
    const { user, body } = req;
    const ticket = await insertTicket(user.id, body)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(201).send({ticket, token})
  }
  catch(err) {
    next(err)
  }
}

exports.patchTicket = async (req, res, next) => {
  try {
    const {user,body} = req;
    const {ticketId} = req.params;
    const ticket = await editTicket(user.id, ticketId, body)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({ticket, token})
  }
  catch(err) {
    next(err)
  }
}

exports.deleteTicket = async (req, res, next) => {
  try {
    const { user } = req;
    const { ticketId } = req.params;
    const ticket = await removeTicket(user.id, ticketId)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({msg: "Ticket deleted", ticket, token})
  }
  catch(err) {
    next(err)
  }
}