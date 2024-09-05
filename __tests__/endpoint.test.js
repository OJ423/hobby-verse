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


describe("Categories", () => {
  // GET EVENTS
  it("responds with all categories", () => {
    return request(app)
    .get("/api/categories/")
    .expect(200)
    .then(({body}) => {
      expect(body.categories.length).toBe(3)
      expect(body.categories[0].name).toBe("Music")
      expect(body.categories[2].description).toBe("Business and tech conferences")
    })
  })
  it("responds with a single category", () => {
    return request(app)
    .get("/api/categories/1")
    .expect(200)
    .then(({body}) => {
        const { category } = body
      expect(category.name).toBe("Music")
      expect(category.description).toBe("Live music events")
    })
  })
  it("responds 404 for non-existent category", () => {
    return request(app)
    .get("/api/categories/11")
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe("This category does not exist")
    })
  })
  it("responds 400 for invalid request", () => {
    return request(app)
    .get("/api/categories/one")
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe("Invalid data type")
    })
  })

  // ADD CATEGORIES
  it("adds a category if the user is admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/categories/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Arts and Crafts",
      description: "Get creative with our arts and crafts events",
    })
    .expect(201)
    .then(({body}) => {
      expect(body.category.name).toBe("Arts and Crafts")
      expect(body.category.description).toBe("Get creative with our arts and crafts events")
    })
  })
  it("adds a category if the user is staff", () => {
    const token = jwt.sign(
      { id: 2, name: "Staff User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/categories/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Arts and Crafts",
      description: "Get creative with our arts and crafts events",
    })
    .expect(201)
    .then(({body}) => {
      expect(body.category.name).toBe("Arts and Crafts")
      expect(body.category.description).toBe("Get creative with our arts and crafts events")
    })
  })
  it("reject a new category if the user is a customer", () => {
    const token = jwt.sign(
      { id: 4, name: "Customer User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/categories/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Arts and Crafts",
      description: "Get creative with our arts and crafts events",
    })
    .expect(401)
    .then(({body}) => {
      expect(body.msg).toBe("You are unauthorized to add an event")
    })
  })

  // EDIT CATEGORIES
  it("edits a category if user is admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .patch("/api/categories/edit/1")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Music Nights",
    })
    .expect(200)
    .then(({body}) => {
      expect(body.category.name).toBe("Music Nights")
    })
  })
  // DELETE CATEGORIES
  it("deletes an event if user is admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .delete("/api/categories/delete/1")
    .set("Authorization", `Bearer ${token}`)
    .expect(200)
    .then(({body}) => {
      expect(body.msg).toBe("Category deleted")
      expect(body.category.name).toBe("Music")
      expect(body.category.description).toBe("Live music events")
    })
  })
})

describe("Tickets", () => {
  // GET TICKETS
  it("responds with all tickets for admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .get("/api/tickets/")
    .set("Authorization", `Bearer ${token}`)
    .expect(200)
    .then(({body}) => {
      expect(body.tickets.length).toBe(5)
      expect(body.tickets[0].name).toBe("General Admission")
      expect(body.tickets[2].description).toBe("Discounted ticket for early purchase")
    })
  })
  it("responds with all tickets for staff", () => {
    const token = jwt.sign(
      { id: 2, name: "Shop User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .get("/api/tickets/")
    .set("Authorization", `Bearer ${token}`)
    .expect(200)
    .then(({body}) => {
      expect(body.tickets.length).toBe(5)
      expect(body.tickets[0].name).toBe("General Admission")
      expect(body.tickets[2].description).toBe("Discounted ticket for early purchase")
    })
  })
  it("prevents unauthorised access for customers trying to access all tickets", () => {
    const token = jwt.sign(
      { id: 4, name: "Customer User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .get("/api/tickets/")
    .set("Authorization", `Bearer ${token}`)
    .expect(401)
    .then(({body}) => {
      expect(body.msg).toBe("You are unauthorized to view all tickets")
    })
  })
  it("responds with a single category", () => {
    return request(app)
    .get("/api/tickets/1")
    .expect(200)
    .then(({body}) => {
      const { ticket } = body
      expect(ticket.name).toBe("General Admission")
      expect(ticket.description).toBe("Access to the main event")
    })
  })
  it("responds 404 for non-existent category", () => {
    return request(app)
    .get("/api/tickets/11")
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toEqual("Ticket cannot be found")
    })
  })
  it("responds 400 for invalid request", () => {
    return request(app)
    .get("/api/tickets/one")
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe("Invalid data type")
    })
  })
  // ADD TICKETS
  it("adds a ticket if the user is admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/tickets/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Family Ticket",
      description: "2 adults and 2 under 16s",
      limitations: null,
      qty_tickets:4,
      price: 35.00,
      is_free: false
    })
    .expect(201)
    .then(({body}) => {
      expect(body.ticket.name).toBe("Family Ticket")
      expect(body.ticket.description).toBe("2 adults and 2 under 16s")
    })
  })
  // EDIT TICKETS
  it("edits a ticket if user is admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .patch("/api/tickets/edit/3")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Early Bird Gets a Discount",
    })
    .expect(200)
    .then(({body}) => {
      expect(body.ticket.name).toBe("Early Bird Gets a Discount")
      expect(body.ticket.price).toBe("30.00")
    })
  })
  // DELETE TICKETS
  it("deletes a ticket if user is admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .delete("/api/tickets/delete/1")
    .set("Authorization", `Bearer ${token}`)
    .expect(200)
    .then(({body}) => {
      expect(body.msg).toBe("Ticket deleted")
      expect(body.ticket.name).toBe("General Admission")
    })
  })
})

describe.only("Event Tickets", () => {
  // ADD EVENT TICKETS
  it("adds event tickets in the user is staff or admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/event-tickets/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      event_id: 1,
      ticket_id: 4,
      quantity: 20
    })
    .expect(201)
    .then(({body}) => {
      expect(body.eventTickets.event_id).toBe(1)
      expect(body.eventTickets.ticket_id).toBe(4)
      expect(body.eventTickets.quantity).toBe(20)
    })
  })
  it("stops event tickets being added if they exceed the event capacity", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/event-tickets/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      event_id: 1,
      ticket_id: 4,
      quantity: 40
    })
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe("Ticket allocation exceeds event capacity. There is room for 40. Each ticket is for 2 heads meaning the quantity being issued is equal to 80 heads")
    })
  })
  it("stops customers from adding event tickets", () => {
    const token = jwt.sign(
      { id: 4, name: "Customer User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .post("/api/event-tickets/new")
    .set("Authorization", `Bearer ${token}`)
    .send({
      event_id: 1,
      ticket_id: 4,
      quantity: 20
    })
    .expect(401)
    .then(({body}) => {
      expect(body.msg).toBe("You are unauthorized to add event tickets")
    })
  })
  // EDIT EVENT TICKETS
  it("edits event tickets if user is admin", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .patch("/api/event-tickets/edit/2")
    .set("Authorization", `Bearer ${token}`)
    .send({
      event_id: 1,
      ticket_id: 2,
      quantity: 20,
    })
    .expect(200)
    .then(({body}) => {
      expect(body.eventTickets.quantity).toBe(20)
      expect(body.eventTickets.event_id).toBe(1)
    })
  })
  it("prevents ticket allocation exceeding event capacity", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .patch("/api/event-tickets/edit/2")
    .set("Authorization", `Bearer ${token}`)
    .send({
      event_id: 1,
      ticket_id: 2,
      quantity: 60,
    })
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toBe("Ticket allocation exceeds event capacity. There is room for 40. Each ticket is for 1 heads meaning the quantity being issued is equal to 60 heads")
    })
  })

  // DELETE EVENT TICKETS

  it("deletes a event tickets if user is admin or staff", () => {
    const token = jwt.sign(
      { id: 1, name: "Admin User" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .delete("/api/event-tickets/delete/1")
    .set("Authorization", `Bearer ${token}`)
    .expect(200)
    .then(({body}) => {
      expect(body.msg).toBe("Event tickets deleted")
    })
  })

  it("stops customers deleting event tickets", () => {
    const token = jwt.sign(
      { id: 4, name: "Customer User 1" }, JWT_SECRET,
      { expiresIn: "15m" }
    );
    return request(app)
    .delete("/api/event-tickets/delete/1")
    .set("Authorization", `Bearer ${token}`)
    .expect(401)
    .then(({body}) => {
      expect(body.msg).toBe("You are unauthorized to delete these event tickets")
    })
  })
})

