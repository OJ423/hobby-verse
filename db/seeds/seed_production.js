const format = require("pg-format");
const { db } = require("../connection");
const { hashPasswords } = require("./utils");

const seedProduction = async () => {
  try {
    // DROP TABLES

    await db.query("DROP TABLE IF EXISTS order_items")
    await db.query("DROP TABLE IF EXISTS orders");
    await db.query("DROP TABLE IF EXISTS event_tickets");
    await db.query("DROP TABLE IF EXISTS tickets");
    await db.query("DROP TABLE IF EXISTS events");
    await db.query("DROP TABLE IF EXISTS event_categories");
    await db.query("DROP TABLE IF EXISTS users");

    // CREATE TABLES

    await db.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) CHECK (role IN ('customer', 'staff', 'admin')) NOT NULL,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`);
    await db.query(`
      CREATE TABLE event_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT
      )`);
    await db.query(`
      CREATE TABLE events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        capacity INT NOT NULL,
        event_category_id INT REFERENCES event_categories(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        img VARCHAR DEFAULT NULL,
        status VARCHAR(10) CHECK (status IN ('draft', 'published')) NOT NULL DEFAULT 'draft',
        CONSTRAINT chk_end_date_after_start_date CHECK (end_date > date)
      )`);
    await db.query(`
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        limitations VARCHAR(255),
        qty_tickets INT NOT NULL DEFAULT 1,
        price NUMERIC(10, 2),
        is_free BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`);
    await db.query(`
      CREATE TABLE event_tickets (
        id SERIAL PRIMARY KEY,
        event_id INT REFERENCES events(id) ON DELETE CASCADE,
        ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
        quantity INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(event_id, ticket_id)
      )`);
    await db.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY, 
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at   TIMESTAMP DEFAULT NOW()
      )`);
    await db.query(`
      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE, 
        event_ticket_id INT REFERENCES event_tickets(id) ON DELETE CASCADE,
        ticket_price NUMERIC(10, 2),
        quantity INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );`)

    // ADD USER
    const encryptedPassword = hashPasswords("shortliquid66")

    await db.query(`INSERT INTO users (
        name, email, password_hash, role, verified)
        VALUES ('Oliver', 'osmith.dpm@gmail.com', $1, 'admin', true)`, [encryptedPassword])

   

  } catch (err) {
    console.log(err);
  }
};

module.exports = seedProduction;
