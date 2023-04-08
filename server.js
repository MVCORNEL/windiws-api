const express = require('express');

//CREATE SERVER
const server = express();

//STARTUP SERVER WITHT HE PORT OF 3000
const SERVER_PORT = 3000;
server.listen(SERVER_PORT, () => {
  console.log('Server running');
});
