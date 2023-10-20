const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { getAllBooks } = require("./service");

dotenv.config();

const app = express();

app.listen(
  process.env.PORT,
  console.log(`Servidor iniciado en puerto ${process.env.PORT}`)
);

app.use(cors());
app.use(express.json());

// get all books
app.get("/books", async (req, res) => {
  try {
    const books = await getAllBooks();
    res.status(200).send(books);
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
