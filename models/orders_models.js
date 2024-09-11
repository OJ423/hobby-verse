const { db } = require('../db/connection')

exports.addOrder = async (userId, { total_amount, payment_status, order_items }) => {
  try {

    // Check ticket availability
    
    for (const item of order_items) {
      const { rows: remainingTickets } = await db.query(`
        SELECT 
          t.name AS ticket_name, 
          et.quantity AS remaining_tickets 
        FROM event_tickets et
        JOIN tickets t ON et.ticket_id = t.id
        WHERE et.id = $1`,
        [item.event_ticket_id]
      )

      if (+remainingTickets[0].remaining_tickets - +item.quantity < 0 ) {
        return Promise.reject({msg: `Sorry, the tickets for ${remainingTickets.ticket_name}, there are only ${remainingTickets.remainingTickets} let.`, status:400})
      }
    }
    
    // User details for order

    const { rows:user } = await db.query(`
      SELECT name, email FROM users 
      WHERE id = $1`, [userId])
    
    const { name, email } = user[0]

    // New Order

    const { rows:newOrder } = await db.query(`
      INSERT INTO orders
      (user_id, customer_name, customer_email, total_amount, payment_status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `, [userId, name, email, total_amount, payment_status])

    const { id: orderId } = newOrder[0]
    
    // Order Items
    let newOrderItems = [];
    for (const item of order_items) {
      const { rows } = await db.query(`
        INSERT INTO order_items
        (order_id, event_ticket_id, ticket_price, quantity)
        VALUES ($1, $2, $3, $4)
        RETURNING *;`,
        [orderId, item.event_ticket_id, item.ticket_price, item.quantity]
      );
      newOrderItems.push(rows[0]);
    }

    // Data to respond
    const {rows: orderConfirmation} = await db.query(`
      SELECT 
        e.id AS event_id,
        e.name AS event_name,
        e.date AS event_date,
        oi.quantity AS ticket_quantity,
        et.id AS event_ticket_id,
        t.name AS ticket_name,
        t.description AS ticket_description,
        oi.ticket_price AS ticket_price,
        t.qty_tickets AS heads_per_ticket
      FROM 
        order_items oi
      JOIN 
        event_tickets et ON oi.event_ticket_id = et.id
      JOIN 
        events e ON et.event_id = e.id
      JOIN 
        tickets t ON et.ticket_id = t.id
      WHERE 
        oi.order_id = $1;`, [orderId],
      )  
    
    const responseBody = {
      order: newOrder[0],
      orderItems: orderConfirmation
    }

    // REDUCE EVENT TICKETS REMAINING
    for (const item of order_items) {
      await db.query(`
        UPDATE event_tickets
        SET quantity = quantity - $1
        WHERE id = $2;`,
      [item.quantity, item.event_ticket_id])
    }

    return responseBody
  }
  catch(err) {
    throw err
  }
}


// Remove Order Item

exports.removeOrderItem = async (userId, orderItemId) => {
  try {
    const { rows } = await db.query(`
      WITH user_check AS (
            SELECT role 
            FROM users 
            WHERE id = $1
        )
      DELETE FROM order_items
      WHERE id = $2
      AND EXISTS (
          SELECT 1
          FROM user_check
          WHERE role = 'admin'
      )
      RETURNING *;
    `, [userId, orderItemId])

    if (!rows.length) {
      return Promise.reject({msg: "You are not authorised to delete this order item", status:401})
    }
    else {
      const {rows:updateOrder} = await db.query(`
        UPDATE orders
        SET total_amount = total_amount - $1
        WHERE id = $2
        RETURNING *`,
      [rows[0].ticket_price, rows[0].order_id])
      
      await db.query(`
        UPDATE event_tickets
        SET quantity = quantity + $1
        WHERE id = $2
        `, [rows[0].quantity, rows[0].event_ticket_id])
      
      return [rows[0], updateOrder[0].total_amount]
    }
  }
  catch(err) {
    throw err
  }
}

// Remove order

exports.removeOrder = async (userId, orderId) => {
  try {
    // Data to update event ticket capacity
    const { rows: orderItems } = await db.query(`
      SELECT quantity, event_ticket_id FROM order_items
      WHERE order_id = $1`, [orderId])

    // Delete order
    const { rows: deletedOrder } = await db.query(`
      WITH user_check AS (
            SELECT role 
            FROM users 
            WHERE id = $1
        )
      DELETE FROM orders
      WHERE id = $2
      AND EXISTS (
          SELECT 1
          FROM user_check
          WHERE role = 'admin'
      )
      RETURNING *;
    `, [userId, orderId])

    // Update Capacity

    for (const item of orderItems) {
      await db.query(`
        UPDATE event_tickets
        SET quantity = quantity + $1
        WHERE id = $2`
      , [item.quantity, item.event_ticket_id])
    }

    return deletedOrder[0]
  }
  catch(err) {
    throw err
  }
}

// GET ALL ORDERS (ADMIN AND STAFF)

exports.fetchOrders = async (userId) => {
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

  const { rows: orders } = await db.query(
    `SELECT * FROM orders`
  )
  return orders
}

// GET ORDERS BY USER

exports.fetchOrderByUser = async (userId) => {
  try {
    const { rows: userOrders } = await db.query(
      `SELECT * FROM orders
      WHERE user_id = $1`,
    [userId])
    
    return userOrders

  }
  catch(err) {
    throw err
  }
}

// GET SINGLE ORDER

exports.fetchOrder = async (userId, orderId) => {
  try {
    const {rows: userRole} = await db.query(`
      SELECT role FROM users
      WHERE id = $1`, [userId])

    const { rows: orderOverview } = await db.query(
      `SELECT * FROM orders
      WHERE id = $1`,
    [orderId])

    if(userRole[0].role === 'customer' && +userId !== +orderOverview[0].user_id) {
      return Promise.reject({status:403, msg: "You are not allowed to view this invoice."})
    }

    const { rows: orderItems } = await db.query(`
      SELECT 
        e.id AS event_id,
        e.name AS event_name,
        e.date AS event_date,
        oi.quantity AS ticket_quantity,
        et.id AS event_ticket_id,
        t.name AS ticket_name,
        t.description AS ticket_description,
        oi.ticket_price AS ticket_price,
        t.qty_tickets AS heads_per_ticket
      FROM 
        order_items oi
      JOIN 
        event_tickets et ON oi.event_ticket_id = et.id
      JOIN 
        events e ON et.event_id = e.id
      JOIN 
        tickets t ON et.ticket_id = t.id
      WHERE 
        oi.order_id = $1;`, [orderId],
    )
    const order = {
      order: orderOverview[0],
      orderItems: orderItems
    }
    
    return order

  }
  catch(err) {
    throw err
  }
}