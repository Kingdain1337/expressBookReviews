const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const SECRET_KEY = 'your_secret_key';

const isValid = (username)=>{ //returns boolean
return users.some(user => user.username === username);
};

const authenticatedUser = async (username,password)=>{ //returns boolean
const user = users.find(user => user.username === username);
if(!user)return false;
const match = await bcrypt.compare(password, user.password);
return match;
}

//only registered users can login
regd_users.post('/login', async (req,res) => {
  const { username, password } = req.body;

  if(!username||!password){
    return res.status(400).json({message: "Username and password are required" })
  }

  if (! await authenticatedUser(username, password)){
    return res.status(401).json({message: "Invalid username or password"})
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h"});
  return res.status(200).json({token});
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const username = req.user.username; // Assuming req.user is populated by the middleware

  if (!book.reviews[username]) {
    book.reviews[username] = review;
    return res.status(200).json({ message: "Review added successfully" });
  } else {
    book.reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully" });
  }
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const username = req.user.username; // Assuming req.user is populated by the middleware

  if (!book.reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  } else {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
