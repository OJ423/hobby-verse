const request = require("supertest");
const jwt = require("jsonwebtoken");
const { db } = require("../db/connection");

const app = require("../app.js");
const seedTest = require("../db/seeds/seed_test.js");
const testData = require("../db/data/test-data/index.js");
const bcrypt = require("bcryptjs/dist/bcrypt.js");

const JWT_SECRET = process.env.JWT_SECRET;

beforeEach(() => seedTest(testData));
afterAll(() => db.end());

describe("Events", () => {
  // GET EVENTS
  it("responds with all events", () => {
    return request(app)
    .get("/api/events/")
    .expect(200)
    .then(({body}) => {
      expect(body.events.length).toBe(3)
      expect(body.events[0].name).toBe("Jazz Night")
      expect(body.events[2].capacity).toBe(200)
    })
  })
  it("responds with events filtered by category", () => {
    return request(app)
    .get("/api/events?category=3")
    .expect(200)
    .then(({body}) => {
      expect(body.events.length).toBe(1)
      expect(body.events[0].name).toBe("Business Conference")
    })

  })
  it("responds with a single event", () => {
    return request(app)
    .get("/api/events/1")
    .expect(200)
    .then(({body}) => {
      const { event } = body
      expect(event.name).toBe("Jazz Night")
      expect(event.description).toBe("An evening of smooth jazz")
    })
  })
  it("responds 404 for non-existent event", () => {
    return request(app)
    .get("/api/events/16")
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe("This event does not exist")
    })
  })
  it("responds 400 for invalid params", () => {
    return request(app)
    .get("/api/events/one")
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe("Invalid data type")
    })
  })
  // ADD EVENTS
  it("adds an event if the user is admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/events/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Watercolour Workshop",
      description: "Local artist, Jane Brush, is coming in for a fantastic hands-on watercolour workshop",
      date: "2024-12-03T16:00:00",
      location: "The Cafe",
      capacity: 15,
      event_category_id: 2,
      img: null,
      status: "draft",
    })
    .expect(201)
    .then(({body}) => {
      expect(body.event.name).toBe("Watercolour Workshop")
      expect(body.event.status).toBe("draft")
      expect(body.event.location).toBe("The Cafe")
    })
  })
  it("adds an event if the user is staff", () => {
    const token = jwt.sign(
      { id: 2, name: "Staff User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/events/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Watercolour Workshop",
      description: "Local artist, Jane Brush, is coming in for a fantastic hands-on watercolour workshop",
      date: "2024-12-03T16:00:00",
      location: "The Cafe",
      capacity: 15,
      event_category_id: 2,
      img: null,
      status: "draft",
    })
    .expect(201)
    .then(({body}) => {
      expect(body.event.name).toBe("Watercolour Workshop")
      expect(body.event.status).toBe("draft")
      expect(body.event.location).toBe("The Cafe")
    })
  })
  it("rejects a new event if the user is a customer", () => {
    const token = jwt.sign(
      { id: 4, name: "Customer User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/events/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Watercolour Workshop",
      description: "Local artist, Jane Brush, is coming in for a fantastic hands-on watercolour workshop",
      date: "2024-12-03T16:00:00",
      location: "The Cafe",
      capacity: 15,
      event_category_id: 2,
      img: null,
      status: "draft",
    })
    .expect(401)
    .then(({body}) => {
      expect(body.msg).toBe("You are unauthorized to add an event")
    })
  })
  it("rejects a new event if data is missing", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/events/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      description: "Local artist, Jane Brush, is coming in for a fantastic hands-on watercolour workshop",
      date: "2024-12-03T16:00:00",
      location: "The Cafe",
      capacity: 15,
      event_category_id: 2,
      img: null,
      status: "draft",
    })
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe("Missing required data")
    })
  })
  // EDIT EVENTS
  it("edits an event if user is admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .patch("/api/events/edit/1")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Jazz Night With Miles Trumpet",
    })
    .expect(200)
    .then(({body}) => {
      expect(body.event.name).toBe("Jazz Night With Miles Trumpet")
      expect(body.event.description).toBe("An evening of smooth jazz")
    })
  })
  it("edits an event if user is staff", () => {
    const token = jwt.sign(
      { id: 2, name: "Staff User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .patch("/api/events/edit/1")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Jazz Night With Miles Trumpet",
    })
    .expect(200)
    .then(({body}) => {
      expect(body.event.name).toBe("Jazz Night With Miles Trumpet")
      expect(body.event.description).toBe("An evening of smooth jazz")
    })
  })
  it("reject edits to an event from customers", () => {
    const token = jwt.sign(
      { id: 4, name: "Customer User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .patch("/api/events/edit/1")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Jazz Night With Miles Trumpet",
    })
    .expect(401)
    .then(({body}) => {
      expect(body.msg).toBe("You are unauthorized to edit this event")
    })
  })
  it("reject edits with invalid data", () => {
    const token = jwt.sign(
      { id: 4, name: "Customer User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .patch("/api/events/edit/1")
    .set("Authorization", `Bearer ${token}`)
    .send({
      capacity: "Twelve",
    })
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe("Invalid data type")
    })
  })
  // DELETE EVENTS
  it("deletes an event if user is admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .delete("/api/events/delete/1")
    .set("Authorization", `Bearer ${token}`)
    .expect(200)
    .then(({body}) => {
      expect(body.msg).toBe("Event deleted")
      expect(body.event.name).toBe("Jazz Night")
      expect(body.event.description).toBe("An evening of smooth jazz")
    })
  })
  it("deletes an event if user is staff", () => {
    const token = jwt.sign(
      { id: 2, name: "Staff User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .delete("/api/events/delete/1")
    .set("Authorization", `Bearer ${token}`)
    .expect(200)
    .then(({body}) => {
      expect(body.msg).toBe("Event deleted")
      expect(body.event.name).toBe("Jazz Night")
      expect(body.event.description).toBe("An evening of smooth jazz")
    })
  })
  it("reject delete an event from customers", () => {
    const token = jwt.sign(
      { id: 4, name: "Customer User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .delete("/api/events/delete/1")
    .set("Authorization", `Bearer ${token}`)
    .expect(401)
    .then(({body}) => {
      expect(body.msg).toBe("You are unauthorized to delete this event")
    })
  })
})
