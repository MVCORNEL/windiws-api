const mongoose = require('mongoose');
const app = require('./app');

//DATABASE CONNECTION
const DATABASE = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DATABASE)?.then((connection) => {
  console.log('Database successfully connected');
});

//GET THE SERVER PORT
const SERVER_PORT = process.env.SERVER_PORT;
//STARTUP SERVER WITH THE GIVEN PORT
app.listen(SERVER_PORT, () => {
  console.log('Server running');
});
