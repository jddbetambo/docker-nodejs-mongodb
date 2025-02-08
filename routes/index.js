// import the express, router, and path objects, allowing us to define the routes we want to export 
// with the router object, and making it possible to work dynamically with file paths
const express = require('express');
const router = express.Router();
const path = require('path');

//Loads a middleware function that will log the router’s requests and pass them on 
// to the application’s route
router.use (function (req,res,next) {
  console.log('/' + req.method);
  next();
});

// Requests to our application’s root will be directed here first, and from here users will be directed 
// to our application’s landing page, the route we will define next
router.get('/',function(req,res){
  res.sendFile(path.resolve('views/index.html'));
});

// make these routes accessible as importable modules elsewhere in the application
module.exports = router;