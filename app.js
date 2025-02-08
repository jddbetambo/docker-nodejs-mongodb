// Set the routes for the application
const express = require('express');
const app = express();
const router = express.Router();

// Add the database connection information
const db = require('./db');

// import for your routes
const sharks = require('./routes/sharks');

const path = __dirname + '/views/';
const port = 8080;

// The app.engine method tells the application to map the EJS template engine to HTML files, 
// while app.set defines the default view engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


// Enable access to the parsed POST data from our shark information form
// extended:true option to enable greater flexibility in the type of data our application will parse
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path));
app.use('/sharks', sharks);

app.listen(port, function () {
  console.log('Example app listening on port 8080!')
})