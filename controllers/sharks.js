// Import the path module to access utilities that will allow us to 
// set the path to the form where users will input their sharks
const path = require('path');

// Import the module with our Shark model
const Shark = require('../models/sharks.js');

// Create an index function to display the sharks page with the input form
exports.index = function (req, res) {
    res.sendFile(path.resolve('views/sharks.html'));
};

// Make a new shark entry in your sharks collection in the database

// exports.create = function (req, res) {
//     var newShark = new Shark(req.body);
//     console.log(req.body);
//     newShark.save(function (err) {
//         if(err) {
//         res.status(400).send('Unable to save shark to database');
//         } else {
//             res.redirect('/sharks/getshark');
//         }
//     });
// };


exports.create = async (req, res) => {
    try {
        const newShark = new Shark({
            name: req.body.name,
            character: req.body.character
        });

        // Save the document using await
        const savedShark = await newShark.save();
        //res.status(201).json(savedShark);
        res.redirect('/sharks/getshark');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Display the collection’s contents back to the user
/* exports.list = function (req, res) {
    Shark.find({}).exec(function (err, sharks) {
        if (err) {
            return res.send(500, err);
        }
        res.render('getshark', {
            sharks: sharks
        });
    });
};
 */
exports.list = async (req, res) => {
    try {
        // Use the await keyword to execute the query
        const sharks = await Shark.find(); // Replace with your query
        //res.status(200).json(sharks);
        res.render('getshark', {
            sharks: sharks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};