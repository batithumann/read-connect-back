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
  updateUserName,
  deleteUser,
  getUserBooks,
  getNumberOfPages,
  followUser,
  getUserBookStatus,
  addUserBookStatus,
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
    res.status(error.code || 500).send(error);
  }
});

app.get("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await getBookById(id);
    res.status(200).send(book);
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

// advanced book search
app.get("/search", async (req, res) => {
  try {
    const queryStrings = req.query;
    const books = await advancedSearch(queryStrings);
    res.status(200).send(books);
  } catch (error) {
    res.status(error.code || 500).send(error);
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
    res.status(error.code || 500).send(error);
  }
});

// get user info
app.get("/user", async (req, res) => {
  try {
    const auth = req.header("Authorization");
    if (!auth) {
      res.status(401).send({ message: "Credenciales inválidas" });
      return;
    }
    const token = auth.split("Bearer ")[1];
    jwt.verify(token, "az_AZ");
    const { email } = jwt.decode(token);
    const user = await getUser(email);
    if (user) {
      const user_books = await getUserBooks(user.id);
      res.status(200).send({ ...user, user_books: user_books });
    } else {
      res.status(401).send({ message: "Credenciales inválidas" });
    }
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

// follow user
app.post("/follow/:id", async (req, res) => {
  try {
    const { id } = req.params;
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
      await followUser(user.id, id);
      res.status(200).send("Siguiendo usuario");
    } else {
      res.status(401).send("Credenciales inválidas");
    }
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

app.put("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.query;
    await updateUserName(name, id);
    res.status(200).send("Nombre modificado con éxito");
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

app.post("/add_user_book_status", async (req, res) => {
  try {
    const { book_id, status } = req.body;
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
      await addUserBookStatus(user.id, book_id, status);
      res.status(200).send("Estado actualizado");
    } else {
      res.status(401).send("Credenciales inválidas");
    }
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

app.get("/book_status/:book_id", async (req, res) => {
  try {
    const { book_id } = req.params;
    const auth = req.header("Authorization");
    if (!auth) {
      res.status(401).send({ message: "Credenciales inválidas" });
      return;
    }
    const token = auth.split("Bearer ")[1];
    jwt.verify(token, "az_AZ");
    const { email } = jwt.decode(token);
    const user = await getUser(email);
    if (user) {
      const book_status = await getUserBookStatus(user.id, book_id);
      res.status(200).send(book_status);
    } else {
      res.status(401).send({ message: "Credenciales inválidas" });
    }
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

app.delete("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    res.status(200).send("Usuario eliminado con éxito");
    await deleteUser(id);
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

app.get("/number_of_pages", async (req, res) => {
  try {
    const numPages = await getNumberOfPages();
    res.status(200).send(numPages);
  } catch (error) {
    res.status(error.code || 500).send(error);
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
