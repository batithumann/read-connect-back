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

const createNestedObjects = (inputArray) => {
  const outputArray = [];

  inputArray.forEach((item) => {
    const existingItem = outputArray.find(
      (outputItem) => outputItem.id === item.id
    );

    if (existingItem) {
      existingItem.author = Array.isArray(existingItem.author)
        ? existingItem.author
        : [existingItem.author];
      existingItem.category = Array.isArray(existingItem.category)
        ? existingItem.category
        : [existingItem.category];

      if (!existingItem.author.includes(item.author)) {
        existingItem.author.push(item.author);
      }

      if (!existingItem.category.includes(item.category)) {
        existingItem.category.push(item.category);
      }
    } else {
      outputArray.push({
        id: item.id,
        title: item.title,
        isbn: item.isbn,
        page_count: item.page_count,
        published_date: item.published_date,
        thumbnail_url: item.thumbnail_url,
        short_description: item.short_description,
        long_description: item.long_description,
        author: item.author,
        category: item.category,
      });
    }
  });

  return outputArray;
};

const simpleSearch = async ({ q }) => {
  let filters = [];
  if (q) {
    filters.push(`lower(title) like '%${q.toLowerCase()}%'`);
    filters.push(`lower(a.name) like '%${q.toLowerCase()}%'`);
    filters.push(`lower(c.name) like '%${q.toLowerCase()}%'`);
  }
  let query = `SELECT b.*, a.name author, c.name category FROM books b 
    LEFT JOIN books_authors ba on b.id = ba.book_id
    LEFT JOIN authors a on a.id = ba.author_id
    LEFT JOIN books_categories bc on b.id = bc.book_id
    LEFT JOIN categories c on c.id = bc.category_id`;
  if (filters.length > 0) {
    filters = filters.join(" OR ");
    query += ` WHERE ${filters}`;
  }
  const { rowCount, rows: books } = await pool.query(query);

  return createNestedObjects(books);
};

const advancedSearch = async ({
  title,
  author,
  category,
  pageCountMin,
  pageCountMax,
  publishDateMin,
  publishDateMax,
}) => {
  let filters = [];
  if (title) filters.push(`lower(title) like '%${title.toLowerCase()}%'`);
  if (author) filters.push(`lower(a.name) like '%${author.toLowerCase()}%'`);
  if (category)
    filters.push(`lower(c.name) like '%${category.toLowerCase()}%'`);
  if (pageCountMin) filters.push(`page_count >= ${pageCountMin}`);
  if (pageCountMax) filters.push(`page_count <= ${pageCountMax}`);
  if (publishDateMin) filters.push(`published_date >= '${publishDateMin}'`);
  if (publishDateMax) filters.push(`published_date <= '${publishDateMax}'`);
  let query = `SELECT b.*, a.name author, c.name category FROM books b 
    LEFT JOIN books_authors ba on b.id = ba.book_id
    LEFT JOIN authors a on a.id = ba.author_id
    LEFT JOIN books_categories bc on b.id = bc.book_id
    LEFT JOIN categories c on c.id = bc.category_id`;
  if (filters.length > 0) {
    filters = filters.join(" AND ");
    query += ` WHERE ${filters}`;
  }
  const { rowCount, rows: books } = await pool.query(query);

  return createNestedObjects(books);
};

const getBookById = async (book_id) => {
  const query = "SELECT * FROM books WHERE id = $1";
  const {
    rowCount,
    rows: [book],
  } = await pool.query(query, [book_id]);
  if (!rowCount)
    throw { code: 404, message: "No se encontró ningún libro con este ID" };
  return book;
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

const getUser = async (email) => {
  const query = "SELECT id, name, email FROM users WHERE email = $1";
  const values = [email];
  const {
    rowCount,
    rows: [user],
  } = await pool.query(query, values);
  if (!rowCount)
    throw { code: 404, message: "No se encontró ningún usuario con este ID" };
  return user;
};

const updateUserName = async (name, id) => {
  const query = "UPDATE users SET name = $1 WHERE id = $2";
  const values = [name, id];
  const result = await pool.query(query, values);
};

const getUserBooks = async (user_id) => {
  const query =
    "SELECT b.* FROM books b join user_books ub on ub.book_id = b.id WHERE ub.user_id = $1";
  const values = [user_id];
  const {
    rowCount,
    rows: [books],
  } = await pool.query(query, values);
  if (!rowCount) return [];
  return books;
};

module.exports = {
  simpleSearch,
  advancedSearch,
  getBookById,
  createUser,
  verifyUser,
  getUser,
  updateUserName,
  getUserBooks,
};
