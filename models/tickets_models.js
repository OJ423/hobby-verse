const { db } = require("../db/connection")

exports.fetchAllTickets = async (userId) => {
  try {
    // Fetch user's role
    const { rows: userRows } = await db.query(`
      SELECT role FROM users
      WHERE id = $1
    `, [userId]);

    // Check if the user is authorized
    if (userRows.length === 0 || userRows[0].role === 'customer') {
      return Promise.reject({
        msg: "You are unauthorized to view all tickets",
        status: 401
      });
    }

    // Fetch all tickets if the user is authorized
    const { rows: tickets } = await db.query(`
      SELECT * FROM tickets
    `);
    
    if (tickets.length === 0) {
      return Promise.reject({
        msg: "No tickets found",
        status: 404
      });
    }

    return tickets;

  } catch (err) {
    throw err;
  }
}

exports.fetchTicket = async (ticketId) => {
  try {
    const { rows } = await db.query(`
      SELECT * FROM tickets
      WHERE id = $1`, [ticketId])
    if(!rows.length) return Promise.reject({status:404, msg:"Ticket cannot be found"})
    return rows[0]
  }
  catch(err) {
    throw err
  }
}

exports.insertTicket = async (userId, {name, description = null, limitations = null, qty_tickets = 1, price = null, is_free = null }) => {
  try {
    const {rows} = await db.query(`
      WITH user_check AS (
        SELECT role 
        FROM users 
        WHERE id = $1
      )
      INSERT INTO tickets 
        (name, description, limitations, qty_tickets, price, is_free)
      SELECT $2, $3, $4, $5, $6, $7
      FROM user_check
      WHERE role IN ('staff', 'admin')
      RETURNING *;  
    `, [userId, name, description, limitations, qty_tickets, price, is_free])
    
    if (!rows.length) {
      return Promise.reject({msg: "You are unauthorized to add a ticket", status: 401})
    }

    return rows[0]
  }
  catch(err) {
    throw(err)
  }
}

exports.editTicket = async ( userId, ticketId, {name = null, description = null, limitations = null, qty_tickets = null, price = null, is_free = null }) => {
  try {
    const {rows} = await db.query(`
      WITH user_check AS (
        SELECT role 
        FROM users 
        WHERE id = $1
      )
      UPDATE tickets
      SET 
        name = COALESCE($3, name),
        description = COALESCE($4, description),
        limitations = COALESCE($5, limitations),
        qty_tickets = COALESCE($6, qty_tickets),
        price = COALESCE($7, price),
        is_free = COALESCE($8, is_free),
        updated_at = NOW()
      FROM user_check
      WHERE id = $2
      AND role IN ('staff', 'admin')
      RETURNING *;
  
    `, [userId, ticketId, name, description, limitations, qty_tickets, price, is_free])
    
    if (!rows.length) {
      return Promise.reject({msg: "You are unauthorized to edit this category", status: 401})
    }

    return rows[0]
  }
  catch(err) {
    throw(err)
  }
}

exports.removeTicket = async ( userId, ticketId) => {
  try {
    const {rows} = await db.query(`
      WITH user_check AS (
          SELECT role 
          FROM users 
          WHERE id = $1
      )
      DELETE FROM tickets
      WHERE id = $2
      AND EXISTS (
          SELECT 1
          FROM user_check
          WHERE role IN ('staff', 'admin')
      )
      RETURNING *;
`, [userId, ticketId])
    
    if (!rows.length) {
      return Promise.reject({msg: "You are unauthorized to delete this category", status: 401})
    }

    return rows[0]
  }

  catch(err) {
    throw(err)
  }

}