const jwt = require("jsonwebtoken");
const { insertEventTickets, editEventTickets, removeEventTickets, fetchEventTickets } = require("../models/event_tickets.models");
const JWT_SECRET = process.env.JWT_SECRET;

exports.postEventTickets = async (req, res, next) => {
  try {
    const { user, body } = req;
    const eventTickets = await insertEventTickets(user.id, body)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(201).send({eventTickets, token})
  }
  catch(err) {
    next(err)
  }
}

exports.patchEventTickets = async (req, res, next) => {
  try {
    const {user,body} = req;
    const {eventTicketsId} = req.params;
    const eventTickets = await editEventTickets(user.id, eventTicketsId, body)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({eventTickets, token})
  }
  catch(err) {
    next(err)
  }
}

exports.deleteEventTickets = async (req, res, next) => {
  try {
    const { user } = req;
    const { eventTicketsId } = req.params;
    const eventTickets = await removeEventTickets(user.id, eventTicketsId)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({msg: "Event tickets deleted", eventTickets, token})
  }
  catch(err) {
    next(err)
  }
}

exports.getEventTickets = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const eventTickets = await fetchEventTickets(eventId);
    res.status(200).send({eventTickets})
  }
  catch(err) {
    next(err)
  }
}
