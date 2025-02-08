// Import the mongoose module 
const mongoose = require('mongoose');

// Define a Schema object to use as the basis for the shark schema
const Schema = mongoose.Schema;

// Define the fields to include in the schema: name and character of each shark
// This definition includes information about the type of input we expect from users

const Shark = new Schema ({
        name: { type: String, required: true },
        character: { type: String, required: true },
});

// Create the Shark model using Mongoose’s model() function
// This model will allow you to query documents from your collection and validate new documents
// This last line makes our Shark model available as a module using the module.exports property. 
// This property defines the values that the module will export, making them available for use elsewhere in the application.

module.exports = mongoose.model('Shark', Shark)