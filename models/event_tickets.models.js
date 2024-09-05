const { db } = require("../db/connection")

exports.insertEventTickets = async (userId, {event_id, ticket_id, quantity}) => {
  try {
    const { rows: spareCapacity } = await db.query(`
      WITH current_tickets_sold AS (
      SELECT
          COALESCE(SUM(t.qty_tickets * et.quantity), 0) AS total_tickets_sold
      FROM
          event_tickets et
      JOIN
          tickets t ON et.ticket_id = t.id
      WHERE
          et.event_id = $1  -- Replace $1 with the event_id you're checking
      )
      SELECT
          e.capacity - cts.total_tickets_sold AS spare_capacity
      FROM
          events e
      JOIN
          current_tickets_sold cts ON e.id = $1  -- Replace $1 with the event_id you're checking
      WHERE
          e.id = $1;
      `, [event_id])

    // How many heads does a ticket include?
    const { rows: headsPerTicket } = await db.query(`
      SELECT qty_tickets FROM tickets
      WHERE id = $1
      `, [ticket_id])
    
    const remainingTicketSpace = +spareCapacity[0].spare_capacity- (+headsPerTicket[0].qty_tickets * +quantity)

    if (remainingTicketSpace < 0) {
      return Promise.reject({
        msg: `Ticket allocation exceeds event capacity. There is room for ${spareCapacity[0].spare_capacity}. Each ticket is for ${headsPerTicket[0].qty_tickets} heads meaning the quantity being issued is equal to ${+headsPerTicket[0].qty_tickets * +quantity} heads`,
        status: 400
      })
    }

    else {
      const {rows: newEventTickets} = await db.query(`
        WITH user_check AS (
          SELECT role 
          FROM users 
          WHERE id = $1
        )
        INSERT INTO event_tickets 
          (event_id, ticket_id, quantity)
        SELECT $2, $3, $4
        FROM user_check
        WHERE role IN ('staff', 'admin')
        RETURNING *;  
      `, [userId, event_id, ticket_id, quantity])
          
      if (!newEventTickets.length) {
        return Promise.reject({msg: "You are unauthorized to add event tickets", status: 401})
      }
  
      return newEventTickets[0]
    }
  }
  catch(err) {
    throw(err)
  }
}

exports.editEventTickets = async (userId, eventTicketsId, {event_id, ticket_id, quantity}) => {
  try {
    const { rows: spareCapacity } = await db.query(`
      WITH current_tickets_sold AS (
      SELECT
          COALESCE(SUM(t.qty_tickets * et.quantity), 0) AS total_tickets_sold
      FROM
          event_tickets et
      JOIN
          tickets t ON et.ticket_id = t.id
      WHERE
          et.event_id = $1  -- Replace $1 with the event_id you're checking
      )
      SELECT
          e.capacity - cts.total_tickets_sold AS spare_capacity
      FROM
          events e
      JOIN
          current_tickets_sold cts ON e.id = $1  -- Replace $1 with the event_id you're checking
      WHERE
          e.id = $1;
      `, [event_id])

    // How many heads does a ticket include?
    const { rows: headsPerTicket } = await db.query(`
      SELECT qty_tickets FROM tickets
      WHERE id = $1
      `, [ticket_id])
    
    const remainingTicketSpace = +spareCapacity[0].spare_capacity- (+headsPerTicket[0].qty_tickets * +quantity)

    if (remainingTicketSpace < 0) {
      return Promise.reject({
        msg: `Ticket allocation exceeds event capacity. There is room for ${spareCapacity[0].spare_capacity}. Each ticket is for ${headsPerTicket[0].qty_tickets} heads meaning the quantity being issued is equal to ${+headsPerTicket[0].qty_tickets * +quantity} heads`,
        status: 400
      })
    }

    else {
      const {rows: newEventTickets} = await db.query(`
      WITH user_check AS (
        SELECT role 
        FROM users 
        WHERE id = $1
      )
      UPDATE event_tickets
      SET 
        event_id = COALESCE($3, event_id),
        ticket_id = COALESCE($4, ticket_id),
        quantity = COALESCE($5, quantity),
        updated_at = NOW()
      FROM user_check
      WHERE id = $2
      AND role IN ('staff', 'admin')
      RETURNING *;  
      `, [userId, eventTicketsId, event_id, ticket_id, quantity])
          
      if (!newEventTickets.length) {
        return Promise.reject({msg: "You are unauthorized to edit event tickets", status: 401})
      }
  
      return newEventTickets[0]
    }
  }
  catch(err) {
    throw(err)
  }
}

exports.removeEventTickets = async ( userId, eventTicketsId) => {
  try {
    const {rows} = await db.query(`
      WITH user_check AS (
          SELECT role 
          FROM users 
          WHERE id = $1
      )
      DELETE FROM event_tickets
      WHERE id = $2
      AND EXISTS (
          SELECT 1
          FROM user_check
          WHERE role IN ('staff', 'admin')
      )
      RETURNING *;
`, [userId, eventTicketsId])
    
    if (!rows.length) {
      return Promise.reject({msg: "You are unauthorized to delete these event tickets", status: 401})
    }

    return rows[0]
  }

  catch(err) {
    throw(err)
  }

}