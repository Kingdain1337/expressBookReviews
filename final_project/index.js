const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({
    secret:"fingerprint_customer",
    resave: true, 
    saveUninitialized: true
}))

app.use("/customer/auth/*", function auth(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).send('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer '

    if (!token) {
        return res.status(403).send('Token is missing');
    }

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(403).send('Token is invalid or expired');
        }

        // Token is valid, allow the request to continue
        req.user = decoded; // Attach the decoded token (user info) to the request object
        next();
    });
});

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/customer/login", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
