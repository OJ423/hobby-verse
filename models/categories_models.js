const { db } = require("../db/connection");

exports.fetchAllCategories = async (category) => {
  try {
    const { rows } = await db.query(`SELECT * FROM event_categories`);  
    if (rows.length === 0) {
      return Promise.reject({
        msg: "There are no event categories",
        status: 404,
      });
    } else {
      return rows;
    }

  } catch (err) {
    throw err;
  }
};

exports.fetchCategory = async (id) => {
  try {
    const { rows } = await db.query(`
      SELECT * FROM event_categories
      WHERE id = $1
      ORDER BY name`, [id]);  
    if (rows.length === 0) {
      return Promise.reject({
        msg: "This category does not exist",
        status: 404,
      });
    } else {
      return rows[0];
    }

  } catch (err) {
    throw err;
  }
};

exports.insertCategory = async (userId, {name, description = null }) => {
  try {
    const {rows} = await db.query(`
      WITH user_check AS (
        SELECT role 
        FROM users 
        WHERE id = $1
      )
      INSERT INTO event_categories 
        (name, description)
      SELECT $2, $3
      FROM user_check
      WHERE role IN ('staff', 'admin')
      RETURNING *;  
    `, [userId, name, description])
    
    if (!rows.length) {
      return Promise.reject({msg: "You are unauthorized to add an event", status: 401})
    }

    return rows[0]
  }
  catch(err) {
    throw(err)
  }
}

exports.editCategory = async ( userId, categoryId, {name = null, description = null }) => {
  try {
    const {rows} = await db.query(`
      WITH user_check AS (
        SELECT role 
        FROM users 
        WHERE id = $1
      )
      UPDATE event_categories
      SET 
          name = COALESCE($3, name),
          description = COALESCE($4, description)
      FROM user_check
      WHERE id = $2
      AND role IN ('staff', 'admin')
      RETURNING *;
  
    `, [userId, categoryId, name, description])
    
    if (!rows.length) {
      return Promise.reject({msg: "You are unauthorized to edit this category", status: 401})
    }

    return rows[0]
  }
  catch(err) {
    throw(err)
  }
}

exports.removeCategory = async ( userId, categoryId) => {
  try {
    const {rows} = await db.query(`
      WITH user_check AS (
          SELECT role 
          FROM users 
          WHERE id = $1
      )
      DELETE FROM event_categories
      WHERE id = $2
      AND EXISTS (
          SELECT 1
          FROM user_check
          WHERE role IN ('staff', 'admin')
      )
      RETURNING *;
`, [userId, categoryId])
    
    if (!rows.length) {
      return Promise.reject({msg: "You are unauthorized to delete this category", status: 401})
    }

    return rows[0]
  }
  catch(err) {
    throw(err)
  }
}