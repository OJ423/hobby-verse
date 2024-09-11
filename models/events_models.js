const { db } = require("../db/connection");

exports.fetchAllEvents = async (category = null, status = 'published') => {
  try {
    let sqlQuery = `SELECT e.*, ec.name AS category_name FROM events e
    JOIN event_categories ec ON e.event_category_id = ec.id
    WHERE e.status = $1 AND e.date > NOW()`;

    const queryParams = [status];
    console.log(status)
    if (category) {
      sqlQuery += ` AND e.event_category_id = $2`
      queryParams.push(category)
    }

    const { rows } = await db.query(sqlQuery, queryParams);
    
    if (rows.length === 0) {
      return Promise.reject({
        msg: "There are no events in the calendar currently",
        status: 404,
      });
    } else {
      return rows;
    }

  } catch (err) {
    throw err;
  }
};

exports.fetchEvent = async (id) => {
  try {
    const {rows} = await db.query(`
      SELECT e.*, ec.name AS category_name FROM events e
      JOIN event_categories ec ON e.event_category_id = ec.id
      WHERE e.id = $1`, [id])
    
    if(rows.length === 0){
      return Promise.reject({msg:"This event does not exist", status:404})
    }
  
    return rows[0]
  }
  catch (err) {
    throw(err)
  }
}

exports.insertEvent = async (userId, {name, description = null, date, location = null, capacity, event_category_id, img, status }) => {
  try {
    const {rows} = await db.query(`
      WITH user_check AS (
        SELECT role 
        FROM users 
        WHERE id = $1
      )
      INSERT INTO events 
        (name, description, date, location, capacity, event_category_id, img, status)
      SELECT $2, $3, $4, $5, $6, $7, $8, $9
      FROM user_check
      WHERE role IN ('staff', 'admin')
      RETURNING *;  
    `, [userId, name, description, date, location, capacity, event_category_id, img, status])
    
    if (!rows.length) {
      return Promise.reject({msg: "You are unauthorized to add an event", status: 401})
    }

    return rows[0]
  }
  catch(err) {
    throw(err)
  }
}


exports.editEvent = async ( userId, eventId, {name = null, description = null, date = null, location = null, capacity = null, event_category_id = null, img = null, status = null }) => {
  try {
    const {rows} = await db.query(`
      WITH user_check AS (
        SELECT role 
        FROM users 
        WHERE id = $1
      )
      UPDATE events
      SET 
          name = COALESCE($3, name),
          description = COALESCE($4, description),
          date = COALESCE($5, date),
          location = COALESCE($6, location),
          capacity = COALESCE($7, capacity),
          event_category_id = COALESCE($8, event_category_id),
          img = COALESCE($9, img),
          status = COALESCE($10, status),
          updated_at = NOW()
      FROM user_check
      WHERE id = $2
      AND role IN ('staff', 'admin')
      RETURNING *;
  
    `, [userId, eventId, name, description, date, location, capacity, event_category_id, img, status])
    
    if (!rows.length) {
      return Promise.reject({msg: "You are unauthorized to edit this event", status: 401})
    }

    return rows[0]
  }
  catch(err) {
    throw(err)
  }
}


exports.removeEvent = async ( userId, eventId) => {
  try {
    const {rows} = await db.query(`
      WITH user_check AS (
          SELECT role 
          FROM users 
          WHERE id = $1
      )
      DELETE FROM events
      WHERE id = $2
      AND EXISTS (
          SELECT 1
          FROM user_check
          WHERE role IN ('staff', 'admin')
      )
      RETURNING *;
`, [userId, eventId])
    
    if (!rows.length) {
      return Promise.reject({msg: "You are unauthorized to delete this event", status: 401})
    }

    return rows[0]
  }
  catch(err) {
    throw(err)
  }
}

// GET EVENT ATTENDEES

exports.fetchEventAttendees = async (userId, eventId) => {
  try {
    // Check user is staff or admin
    const { rows: authCheck } = await db.query(`
      SELECT role FROM users
      WHERE id = $1`, [userId])
    
    if (authCheck[0].role === "customer" || !authCheck.length) {
      return Promise.reject({msg: "You are not authorised to see this.", status: 401})
    }

    const { rows: attendees } = await db.query(`
      SELECT 
        e.id AS event_id,
        e.name AS event_name,
        u.id AS customer_id,
        u.name AS customer_name,
        u.email AS customer_email,
        t.name AS ticket_name,
        oi.ticket_price AS ticket_cost,
        oi.quantity AS ticket_quantity
      FROM 
        orders o
      JOIN 
        order_items oi ON o.id = oi.order_id
      JOIN 
        event_tickets et ON oi.event_ticket_id = et.id
      JOIN
        events e ON et.event_id = e.id
      JOIN 
        tickets t ON et.ticket_id = t.id
      JOIN 
        users u ON o.user_id = u.id
      WHERE 
        et.event_id = $1;`, [eventId])
    
    return attendees
  }
  catch(err) {
    throw err
  }
}
