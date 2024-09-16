const { fetchAllEvents, fetchEvent, insertEvent, editEvent, removeEvent, fetchEventAttendees } = require("../models/events_models")
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;


exports.getAllEvents = async (req, res, next) => {
  try{
    const { category, status } = req.query
    const {events} = await fetchAllEvents(category, status)
    res.status(200).send({events})
  }
  catch(err) {
    next(err)
  }
}

exports.getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await fetchEvent(id)
    res.status(200).send({event})
  }
  catch(err) {
    next(err)
  }
}

exports.postEvent = async (req, res, next) => {
  try {
    const {body, user} = req;
    const event = await insertEvent(user.id, body)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(201).send({event, token})
  }
  catch(err) {
    next(err)
  }
}

exports.patchEvent = async (req, res, next) => {
  try {
    const {body, user} = req;
    const {eventId} = req.params;
    const event = await editEvent(user.id, eventId, body)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({event, token})
  }
  catch(err) {
    next(err)
  }
}

exports.deleteEvent = async (req, res, next) => {
  try {
    const {user} = req;
    const {eventId} = req.params;
    const event = await removeEvent(user.id, eventId)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({ event, token, msg: "Event deleted"})
  }
  catch(err) {
    next(err)
  }
}


exports.getEventAttendees = async (req, res, next) => {
  try {
    const { user } = req;
    const {eventId} = req.params;
    const attendees = await fetchEventAttendees(user.id, eventId)
    const token = await jwt.sign(
      { id: user.id, name: user.name }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).send({attendees, token})
  }
  catch(err) {
    next(err)
  }
}

