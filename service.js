const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  allowExitOnIdle: true,
});

const getAllBooks = async () => {
  const query = "SELECT * FROM books";
  const { rowCount, rows: books } = await pool.query(query);
  return books;
};

module.exports = {
  getAllBooks,
};
