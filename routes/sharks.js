// import a module called shark that will allow you to work with the exported functions 
// you defined with your controller
const express = require('express');
const router = express.Router();
const shark = require('../controllers/sharks');


// routes using the index, create, and list functions you defined in your sharks controller file. 
// Each route will be associated with the appropriate HTTP method: GET in the case of rendering 
// the main sharks information landing page and returning the list of sharks to the user, 
// and POST in the case of creating a new shark entry 

// Each route makes use of the related function in controllers/sharks.js, 
// since we have made that module accessible by importing it at the top of this file.
router.get('/', function(req, res){
    shark.index(req,res);
});

router.post('/addshark', function(req, res) {
    shark.create(req,res);
}); 

//router.post('/addshark', sharksController.create);

// attaching these routes to the router object and exporting them
router.get('/getshark', function(req, res) {
    shark.list(req,res);
});

module.exports = router;