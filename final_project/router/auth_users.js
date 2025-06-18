const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    const sameUser = users.filter((user) => user.username === username);
    if (sameUser.length > 0) {
        return false;
    }
    return true;
}


const authenticatedUser = (username, password) => { //returns boolean
    const findUser = users.filter(user => user.username === username && user.password === password);
    return findUser !== undefined
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: "Username and Password are required" });
    }
    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username: username }, "access", { expiresIn: '1h' });
        req.session.authorization = {
            accessToken,
            username
        }
        return res.status(200).json({ message: "User successfully logged in", token: accessToken })
    } else {
        return res.status(400).json({ message: "Invalid Username or password"})
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn=req.params.isbn;
    const review = req.query.review;
    const username= req.session.authorization?.username;
    if(!username){
        return res.status(401).json({message:"User is not logged in"});
    }
    if(!books[isbn]){
        return res.status(404).json({message:`Book with ${isbn} not found`});
    }
    if(!books[isbn].reviews){
        books[isbn].reviews={};
    }
    books[isbn].reviews[username]=review;
    return res.status(200).json({ message: `Review for ISBN ${isbn} added/updated by user ${username}` });
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: `Review deleted for ISBN ${isbn} by user ${username}` });
    } else {
        return res.status(404).json({ message: "No review found for this user to delete" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
