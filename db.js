// First, import the mongoose module using the require function.
// This will give you access to Mongoose’s built-in methods, which you will use to create the connection to your database.
const mongoose = require('mongoose');

// Define information for Mongo’s connection URI
const MONGO_USERNAME = 'mongouser';
const MONGO_PASSWORD = 'some-password*1';
const MONGO_HOSTNAME = '127.0.0.1';
const MONGO_PORT = '27017';
const MONGO_DB = 'sharkinfo';

// define a constant for the URI and create the connection using the mongoose.connect() method
const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to MongoDB'))

    .catch(err => console.error('Error connecting to MongoDB:', err));