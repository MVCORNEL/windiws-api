const dotenv = require('dotenv');
const express = require('express');

//SETUP CONFIG VARIABLES
dotenv.config({ path: './config.env' });

//CREATE SERVER
const app = express();

//ROUTING GET REQUEST
app.get('/', (req, res) => {
  //SEND A MESSGE BACK TO THE CLIENT
  res.status(200).send('Hello from the server side');
});

module.exports = app;
