## Integrate MongoDB with Your Node Application
<p align="center">
    <img src="images/mongo1.png">
</p>

<div style="text-align: justify">

As you work with Node.js, you may find yourself developing a project that stores and queries data. In this case, you will need to choose a database solution that makes sense for your application’s data and query types.

In this tutorial, you will integrate a MongoDB database with an existing Node application. NoSQL databases like MongoDB can be useful if your data requirements include scalability and flexibility. MongoDB also integrates well with Node since it is designed to work asynchronously with JSON objects.

To integrate MongoDB into your project, you will use the Object Document Mapper (ODM) [Mongoose](https://mongoosejs.com/) to create schemas and models for your application data. This will allow you to organize your application code following the model-view-controller [(MVC) architectural pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller), which lets you separate the logic of how your application handles user input from how your data is structured and rendered to the user. Using this pattern can facilitate future testing and development by introducing a separation of concerns into your codebase.

At the end of the tutorial, you will have a working shark information application that will take a user’s input about their favorite sharks and display the results in the browser:

<p align="center">
    <img src="images/mongo2.png">
</p>

## Prerequisites
- A local development machine or server running Ubuntu 18.04 a newer, along with a non-root user with sudo privileges and an active firewall. 
- Node.js and npm installed on your machine or server [following these instructions on installing with the PPA managed by NodeSource](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04#installing-using-a-ppa)
- MongoDB installed on your machine or server [follow this link to How To Install MongoDB in Ubuntu](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)

## Step 0 - Installaing MongoDB and Nodejs on ubuntu

### Installaing MongoDB on ubuntu

MongoDB 8.0 Community Edition supports the following 64-bit Ubuntu LTS (long-term support) releases on x86_64 architecture:

    24.04 LTS ("Noble")

    22.04 LTS ("Jammy")

    20.04 LTS ("Focal")

MongoDB only supports the 64-bit versions of these platforms. To determine which Ubuntu release your host is running, run the following command on the host's terminal:

```bash
cat /etc/lsb-release
```

Follow these steps to install MongoDB Community Edition using the apt package manager.

**1. Import the public key.**

From a terminal, install gnupg and curl if they are not already available:

```bash
sudo apt-get install gnupg curl
```

To import the MongoDB public GPG key, run the following command:

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
   --dearmor
```

**2. Create the list file.**

Create the list file `/etc/apt/sources.list.d/mongodb-org-8.0.list` for your version of Ubuntu.

```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
```

**3. Reload the package database.**

Issue the following command to reload the local package database:

```bash
sudo apt-get update
```

**4. Install MongoDB Community Server.**

You can install either the latest stable version of MongoDB or a specific version of MongoDB.

```bash
sudo apt-get install -y mongodb-org
```

**5. Start MongoDB.**

You can start the mongod process by issuing the following command:

```bash
sudo systemctl start mongod
```

**6. Verify that MongoDB has started successfully.**

```bash
sudo systemctl status mongod
```

You can optionally ensure that MongoDB will start following a system reboot by issuing the following command:

```bash
sudo systemctl enable mongod
```

**7. Restart MongoDB.**

You can restart the mongod process by issuing the following command:

```bash
sudo systemctl restart mongod
```

You can follow the state of the process for errors or important messages by watching the output in the `/var/log/mongodb/mongod.log` file.

**8. Begin using MongoDB.**
- Allow traffic on port 27017.

```bash
sudo ufw status
```

```bash
sudo ufw enable
```

```bash
sudo ufw allow 27017
```

```bash
sudo ufw status
```

- Add your server’s IP address to the bindIP value:

Edit the file `/etc/mongod.conf` and add the IP address of your ubuntu machine.

```bash
sudo vi /etc/mongod.conf
```

<p align="center">
    <img src="images/mongo3.png" width="75%">
</p>

Restart the MongoDB database server

```bash
sudo systemctl restart mongod
```

- Start a mongosh session on the same host machine as the mongod. You can run mongosh without any command-line options to connect to a mongod that is running on your localhost with default port 27017.

```bash
mongosh
```

<p align="center">
    <img src="images/mongo4.png" width="80%">
</p>

For more information on connecting using **`mongosh`**, such as to connect to a **`mongod`** instance running on a different host and/or port, [see the mongosh documentation](https://www.mongodb.com/docs/mongodb-shell/).

To help you start using MongoDB, MongoDB provides [Getting Started Guides](https://www.mongodb.com/docs/mongodb-shell/) in various driver editions. For the driver documentation, see [Start Developing with MongoDB](https://api.mongodb.com/).

to exit mongosh type the command exit.

```bash
mongosh
```

### Installaing Nodejs on ubuntu

Ubuntu contains a version of Node.js in its default repositories that can be used to provide a consistent experience across multiple systems.

```bash
sudo apt update && sudo apt install nodejs
```

```bash
node -v
```

```bash
sudo apt install npm
```

## Step 1 — Creating a Mongo User

Before we begin working with the application code, we will create an administrative user that will have access to our application’s database. This user will have administrative privileges on any database, which will give you the flexibility to switch and create new databases as needed.

Next, open the Mongo shell to create your user:

```bash
mongosh
```

In the shell, specify that you want to use the `admin database` to create your user:

```bash
use admin
```

Next, create a role and password by adding a **username** and **password** with the `db.createUser` command. After you type this command, the shell will prepend three dots before each line until the command is complete. Be sure to replace the user and password provided here with your own username and password:

```bash
db.createUser(
  {
    user: "mongouser",
    pwd: "some-password*1",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)
```

This creates an entry for the user `mongouser` in the `admin database`. The username you select and the `admin database` will serve as identifiers for your user.

The output for the entire process will look like this, including the message indicating that the entry was successful:

<p align="center">
    <img src="images/mongo5.png" width="85%">
</p>

With your user and password created, you can now exit the Mongo shell:

```bash
exit
```
Now that you have created your database user, you can move on to cloning the starter project code and adding the Mongoose library, which will allow you to implement schemas and models for the collections in your databases.


## Step 2 — Adding Mongoose and Database Information to the Project
Our next steps will be to clone the application starter code and add Mongoose and our MongoDB database information to the project.

In your non-root user’s home directory, clone the [`nodejs-image-demo repository`](https://github.com/jddbetambo/docker-nodejs-app.git) from my GitHub account. This repository includes the code from the setup described in How To Build a Node.js Application with Docker.

Before modifying the project code, let’s take a look at the project’s structure using the tree command.

```bash
sudo apt install tree
```

<p align="center">
    <img src="images/mongo6.png" width="85%">
</p>

We will be adding directories to this project as we move through the tutorial, and tree will be a useful command to help us track our progress.

Next, add the **`mongoose npm package`** to the project with the **`npm install`** command:

```bash
npm install mongoose
```

This command will create a **node_modules** directory in your project directory, using the dependencies listed in the project’s **package.json** file, and will add **mongoose** to that directory. It will also add **mongoose** to the dependencies listed in your **package.json** file. 

Before creating any **Mongoose schemas or models**, we will add our database connection information so that our application will be able to connect to our database.

In order to separate your application’s concerns as much as possible, create a separate file for your database connection information called **`db.js`**. You can create this file with your favorite editor:

```bash
vi db.js
```

```bash
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
```

**Explanation**
- **mongoose.connect**: This function is the core method in Mongoose to establish a connection to your MongoDB database.
- **url**: The connection string that specifies your MongoDB server address, port, and database name.
- **useNewUrlParser: true** and **useUnifiedTopology: true**: These options are recommended for newer MongoDB versions to ensure proper connection handling. 

**Important Considerations**:
- **Authentication**: If your MongoDB database requires authentication, always include username and password in the connection string like this: mongodb://username:password@localhost:27017/your_database_name.
- **Error Handling**: Always include error handling within the .catch block to gracefully manage connection issues.
- **Remote Access**: If you want to connect to a MongoDB instance on a different server, replace localhost with the appropriate server address in the connection string.


With your database information in place and Mongoose added to your project, you are ready to create the schemas and models that will shape the data in your `sharks` collection.

## Step 3 — Creating Mongoose Schemas and Models

Our next step will be to think about the structure of the `sharks` collection that users will be creating in the `sharkinfo` database with their input. What structure do we want these created documents to have? The shark information page of our current application includes some details about different `sharks` and their behaviors.

In keeping with this theme, we can have users add new sharks with details about their overall character. This goal will shape how we create our schema.

To keep your schemas and models distinct from the other parts of your application, create a `models directory` in the current project directory and cd into it:

```bash
mkdir models
cd models
```

Next, create inside the models directory, a file called **`sharks.js`** to build your schema and model:

```bash
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
```

With the Shark schema and model in place, you can start working on the logic that will determine how your application will handle user input.

## Step 4 — Creating Controllers

Our next step will be to create the controller component that will determine how user input gets saved to our database and returned to the user.

First, create a directory for the **`controller`** in the root project directory:

```bash
mkdir controllers
cd controllers
```

Next, open a file called `sharks.js` in the folder `controllers`

```bash
// Import the path module to access utilities that will allow us to 
// set the path to the form where users will input their sharks
const path = require('path');

// Import the module with our Shark model
const Shark = require('../models/sharks');

// Create an index function to display the sharks page with the input form
exports.index = function (req, res) {
    res.sendFile(path.resolve('views/sharks.html'));
};

// Make a new shark entry in your sharks collection in the database
exports.create = function (req, res) {
    var newShark = new Shark(req.body);
    console.log(req.body);
    newShark.save(function (err) {
        if(err) {
        res.status(400).send('Unable to save shark to database');
        } else {
            res.redirect('/sharks/getshark');
        }
    });
};

// Display the collection’s contents back to the user
exports.list = function (req, res) {
    Shark.find({}).exec(function (err, sharks) {
        if (err) {
            return res.send(500, err);
        }
        res.render('getshark', {
            sharks: sharks
        });
    });
};
```

This time, for the sake of brevity, we’ll tell tree to omit the node_modules directory using the `-I` option.With the additions you’ve made, your project’s structure will look like this: 

```bash
tree -I node_modules
```
<p align="center">
    <img src="images/mongo7.png" width="85%">
</p>

Now that you have a controller component to direct how user input gets saved and returned to the user, you can move on to creating the views that will implement your controller’s logic.

## Step 5 — Using EJS and Express Middleware to Collect and Render Data
To enable our application to work with user data, we will do two things: first, we will include a built-in Express middleware function, **`urlencoded()`**, that will enable our application to parse our user’s entered data. Second, we will add template tags to our views to enable dynamic interaction with user data in our code.

To work with Express’s `urlencoded()` function, first open your `app.js` file, above your `express.static()` function, add the following line.

```bash
app.use(express.urlencoded({ extended: true }));
```

Adding this function will enable access to the parsed POST data from our shark information form. We are specifying **true** with the **extended** option to enable greater flexibility in the type of data our application will parse (including things like nested objects). 

Next, we will add template functionality to our `views`. First, install the **`ejs package`** with `npm install`:

```bash
npm install ejs
```

Next, open the `sharks.html` file in the `views` folder:

```bash
vi views/sharks.html
```

Now, rather than having a two column layout, we will introduce a third column with a form where users can input information about sharks.

As a first step, change the dimensions of the existing columns to 4 to create three equal-sized columns. Note that you will need to make this change on the two lines that currently read `<div class="col-lg-6">`. These will both become `<div class="col-lg-4">`.

In the form tag, you are adding a `"/sharks/addshark"` endpoint for the user’s shark data and specifying the POST method to submit it. In the input fields, you are specifying fields for `"Shark Name"` and `"Shark Character"`, aligning with the `Shark model` you defined earlier.

To add the user input to your `sharks collection`, you are using **EJS template tags** (`<%=, %>`) along with JavaScript syntax to map the user’s entries to the appropriate fields in the newly created document.

The entire container with all three columns, including the column with your shark input form, will look like this when finished:

```bash
...
<div class="container">
    <div class="row">
        <div class="col-lg-4">
            <p>
                <div class="caption">Some sharks are known to be dangerous to humans, though many more are not. The sawshark, for example, is not considered a threat to humans.
                </div>
                <img src="https://assets.digitalocean.com/articles/docker_node_image/sawshark.jpg" alt="Sawshark">
            </p>
        </div>
        <div class="col-lg-4">
            <p>
                <div class="caption">Other sharks are known to be friendly and welcoming!</div>
                <img src="https://assets.digitalocean.com/articles/docker_node_image/sammy.png" alt="Sammy the Shark">
            </p>
        </div>
	<div class="col-lg-4">
            <p>
                <form action="/sharks/addshark" method="post">
                    <div class="caption">Enter Your Shark</div>
                    <input type="text" placeholder="Shark Name" name="name" <%=sharks[i].name; %>
                    <input type="text" placeholder="Shark Character" name="character" <%=sharks[i].character; %>
                    <button type="submit">Submit</button>
                </form>
            </p>
        </div>
    </div>
  </div>

</html>
```

Now that you have a way to collect your user’s input, you can create an endpoint to display the returned sharks and their associated character information.

Copy the newly modified `sharks.html` file to a file called `getshark.html`:

```bash
cp views/sharks.html views/getshark.html
```

Open `getshark.html`. 

Inside the file, we will modify the column that we used to create our sharks input form by replacing it with a column that will display the `sharks` in our sharks collection. Again, your code will go between the existing `</p>` and `</div>` tags from the preceding column and the closing tags for the row, container, and HTML document. 

The entire container with all three columns, including the column with your sharks collection, will look like this when finished:

```
...
<div class="container">
    <div class="row">
        <div class="col-lg-4">
            <p>
                <div class="caption">Some sharks are known to be dangerous to humans, though many more are not. The sawshark, for example, is not considered a threat to humans.
                </div>
                <img src="https://assets.digitalocean.com/articles/docker_node_image/sawshark.jpg" alt="Sawshark">
            </p>
        </div>
        <div class="col-lg-4">
            <p>
                <div class="caption">Other sharks are known to be friendly and welcoming!</div>
                <img src="https://assets.digitalocean.com/articles/docker_node_image/sammy.png" alt="Sammy the Shark">
            </p>
        </div>
	<div class="col-lg-4">
            <p>
              <div class="caption">Your Sharks</div>
                  <ul>
                     <% sharks.forEach(function(shark) { %>
                        <p>Name: <%= shark.name %></p>
                        <p>Character: <%= shark.character %></p>
                     <% }); %>
                  </ul>
            </p>
        </div>
    </div>
  </div>

</html>
```

In order for the application to use the templates you’ve created, you will need to add a few lines to your `app.js` file. Open it again. Above where you added the `express.urlencoded()` function, add the following lines:

```bash
...
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
...
```


Now that you have created views that can work dynamically with user data, it’s time to create your project’s routes to bring together your views and controller logic.

## Step 6 — Creating Routes

The final step in bringing the application’s components together will be creating routes. We will separate our routes by function, including a route to our application’s landing page and another route to our sharks page. Our `sharks` route will be where we integrate our controller’s logic with the views we created in the previous step.

First, create a `routes` directory int the root project directory:

```bash
mkdir routes
```

Next, create a file called `index.js` in this directory:

```bash
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
```

Next, create a file called `sharks.js` in the routes directory to define how the application should use the different endpoints and views we’ve created to work with our user’s shark input:

```bash
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

// attaching these routes to the router object and exporting them
router.get('/getshark', function(req, res) {
    shark.list(req,res);
});

module.exports = router;
```

The last step in making these routes accessible to your application will be to add them to `app.js`. Open that file again. Below your `db` constant, add the following import for your routes:

```bash
...
const db = require('./db');
const sharks = require('./routes/sharks');
```

Next, replace the app.use function that currently mounts your router object with the following line, which will mount the sharks router module:

```bash
...
app.use(express.static(path));
app.use('/sharks', sharks);

app.listen(port, function () {
        console.log("Example app listening on port 8080!")
})
```

The final version of your `app.js` file will look like this:

```bash
const express = require('express');
const app = express();
const router = express.Router();
const db = require('./db');
const sharks = require('./routes/sharks');

const path = __dirname + '/views/';
const port = 8080;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path));
app.use('/sharks', sharks);

app.listen(port, function () {
  console.log('Example app listening on port 8080!')
})
```

You can now run tree again to see the final structure of your project:

```bash
tree -I node_modules
```

<p align="center">
    <img src="images/mongo8.png" width="85%">
</p>


With all of your application components created and in place, you are now ready to add a test shark to your database!

If you followed the initial server setup tutorial in the prerequisites, you will need to modify your firewall, since it currently only allows SSH traffic. To permit traffic to port `8080` run:

```bash
sudo ufw allow 8080
```

Start the application:

```bash
node app.js
```



## Sources
- https://www.digitalocean.com/community/tutorials/how-to-integrate-mongodb-with-your-node-application
- https://expressjs.com/
- https://getbootstrap.com/
- https://docs.npmjs.com/cli/v11/configuring-npm/package-json
- https://getbootstrap.com/docs/4.0/components/jumbotron/
- https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04#option-2-installing-node-js-with-apt-using-a-nodesource-ppa
- https://www.digitalocean.com/community/tutorials/how-to-build-a-node-js-application-with-docker

</div>