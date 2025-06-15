const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validate request
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Add user to users array
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  return res.status(200).json(books[isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const matchingBooks = Object.entries(books)
    .filter(([id, book]) => book.author.toLowerCase() === author.toLowerCase())
    .map(([id, book]) => ({ id, ...book }));

  if (matchingBooks.length === 0) {
    return res.status(404).json({ message: "No books found for the given author" });
  }

  return res.status(200).json(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const matchingBooks = Object.entries(books)
    .filter(([id, book]) => book.title.toLowerCase() === title.toLowerCase())
    .map(([id, book]) => ({ id, ...book }));

  if (matchingBooks.length === 0) {
    return res.status(404).json({ message: "No books found with the given title" });
  }

  return res.status(200).json(matchingBooks);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
