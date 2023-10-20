const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

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

const createUser = async (name, email, password) => {
  const queryRevision = "SELECT * FROM users WHERE email = $1";
  const {
    rows: [user],
  } = await pool.query(queryRevision, [email]);
  if (user) {
    throw {
      code: 401,
      message: "Ya existe un usuario registrado con ese email",
    };
  }
  const hashedPassword = bcrypt.hashSync(password);
  const query = "INSERT INTO users VALUES (DEFAULT, $1, $2, $3)";
  const values = [name, email, hashedPassword];
  const result = await pool.query(query, values);
  return result;
};

const verifyUser = async (email, password) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const values = [email];

  const {
    rows: [user],
    rowCount,
  } = await pool.query(query, values);
  if (!user) {
    throw {
      code: 401,
      message: "Credenciales inválidas",
    };
  }
  const { password_hash: password_hash } = user;
  const password_correct = bcrypt.compareSync(password, password_hash);

  if (!password_correct || !rowCount) {
    throw {
      code: 401,
      message: "Credenciales inválidas",
    };
  }
};

module.exports = {
  getAllBooks,
  createUser,
  verifyUser,
};
