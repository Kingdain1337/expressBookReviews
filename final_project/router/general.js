const express = require('express');
const bcrypt = require('bcrypt');
let getBooks = require("./booksdb.js").getBooks;
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post('/register', async (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully' });
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  try{
    const booksData = await getBooks();
    const allBooks = Object.values(booksData).map(book => book.title);
    return res.status(200).json({allBooks});
  } catch(error){
    return res.status(500).json({error: "failed to fetch book data"});
  }

});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  try{
    const isbn = req.params.isbn;
    const booksData = await getBooks();
    const book = booksData[isbn];
    if (book){
      return res.status(200).json(book);
    } else {
      return res.status(404).json({message: "Book not found"});
    };
  } catch(error){
    return res.status(500).json({message: "failed to fetch book"});
  };
});
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  try{
    const bookData = await getBooks();
    const author = req.params.author;
    const booksByAuthor = Object.values(bookData).filter(book => book.author === author);

    if (booksByAuthor){
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({message: "Author not found"});
    };
  } catch(error){
    return res.status(500).json({message: "failed to fetch Author"});
  };
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try{
    const bookData = await getBooks();
    const title = req.params.title;
    const booksByTitle = Object.values(bookData).filter(book => book.title === title);

    if (booksByTitle){
      return res.status(200).json(booksByTitle);
    } else {
      return res.status(404).json({message: "Title not found"});
    };
  } catch(error){
    return res.status(500).json({message: "failed to fetch Title"});
  };
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  try{
    const bookData = await getBooks();
    const isbn = req.params.isbn;
    const bookByIsbn = bookData[isbn];
    const review = bookByIsbn.reviews;

    if (review){
      return res.status(200).json(review);
    } else {
      return res.status(404).json({message: "reviews not found"});
    };
  } catch(error){
    return res.status(500).json({message: "failed to fetch review"});
  };
});

module.exports.general = public_users;
