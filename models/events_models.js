const { db } = require("../db/connection");

exports.fetchAllEvents = async (category) => {
  try {
    let sqlQuery = `SELECT * FROM events WHERE status = $1`

    const queryParams = ["published"];

    if (category) {
      sqlQuery += ` AND event_category_id = $2`
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
      SELECT * FROM events
      WHERE id = $1`, [id])
    
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
