const dotenv = require('dotenv');
const express = require('express');
const userRouter = require('./routes/userRouter');
//SETUP CONFIG VARIABLES
dotenv.config({ path: './config.env' });
//CREATE SERVER
const app = express();

//MIDDLEWARE FUNCTIONS USED TO MODIFY THE INCOMING REQUEST DATA
//BODY PARSER - PUT THE BODY DATA COMING FROM THE USER ON THE REQUEST OBJECT (15 KB LIMIT)
app.use(express.json({ limit: '15kb' }));

//Mount the application routes
app.get('/', (req, res) => {
  res.status(200).send('Hello form the server side');
});

app.use('/api/v1/users', userRouter);

module.exports = app;
