const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const {
  simpleSearch,
  advancedSearch,
  getBookById,
  createUser,
  verifyUser,
  getUser,
  getUserBooks,
} = require("./service");

dotenv.config();

const app = express();

app.listen(
  process.env.PORT,
  console.log(`Servidor iniciado en puerto ${process.env.PORT}`)
);

app.use(cors());
app.use(express.json());

// simple book search
app.get("/books", async (req, res) => {
  try {
    const queryStrings = req.query;
    const books = await simpleSearch(queryStrings);
    res.status(200).send(books);
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

app.get("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await getBookById(id);
    res.status(200).send(book);
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

// advanced book search
app.get("/books/search", async (req, res) => {
  try {
    const queryStrings = req.query;
    const books = await advancedSearch(queryStrings);
    res.status(200).send(books);
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

// sign up
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await createUser(name, email, password);
    res.status(200).send(`Usuario ${email} registrado`);
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    await verifyUser(email, password);
    const token = jwt.sign({ email: email }, "az_AZ");
    res.status(200).send(token);
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

// get user info
app.get("/user", async (req, res) => {
  try {
    const auth = req.header("Authorization");
    if (!auth) {
      res.status(401).send("Credenciales inválidas");
      return;
    }
    const token = auth.split("Bearer ")[1];
    jwt.verify(token, "az_AZ");
    const { email } = jwt.decode(token);
    const user = await getUser(email);
    if (user) {
      const user_books = await getUserBooks(user.id);
      console.log({ ...user, user_books: user_books });
      res.status(200).send({ ...user, user_books: user_books });
    } else {
      res.status(401).send("Credenciales inválidas");
    }
  } catch (error) {
    res.status(error.code || 500).send(error.message || "Ocurrió un error");
  }
});

app.get("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

app.post("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

app.delete("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

app.put("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

module.exports = app;
