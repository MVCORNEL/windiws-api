const mongoose = require('mongoose');

/**
 * Process listener that triggers when  SYNCHRONOUS BUGS are not handled.
 * Function used to crash the application if there is any sort of, this can be server initialization.
 * Whenever the code has an UNCAUGHT EXCEPTION, the entire node process is in a so-called unclean state, it has to be shut down immediatelly.
 */
process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION  💥! Shutting down.... ');
  console.log(err.name, err.message);
  console.log(err);
  process.exit(1);
});

const app = require('./app');

//DATABASE CONNECTION
const DATABASE = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DATABASE)?.then((connection) => {
  console.log('Database successfully connected');
});

//GET THE SERVER PORT
const SERVER_PORT = process.env.SERVER_PORT;
//STARTUP SERVER WITH THE GIVEN PORT
const server = app.listen(SERVER_PORT, () => {
  console.log(`Server running on the port`, SERVER_PORT);
});

/** Process listener that triggers when  asynchronous ERORR are not handled, this errors must from outside of the express environment

*/
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION  💥! Shutting down.... ');
  //IF WE''LL HAVE A PROBLEM AS THE DB CONNECTION OUR APP IS NOT GONNA WORK AT ALL
  //IN THIS CASE HERE, ALL WE CAN DO IS TO SHUT DOWN OUR APPLICATION
  console.log(err.name, err.message);
  //SHUT DOWN THE APP THE CODE
  //0 STAND FOR SUCCESS
  //1 STANDS FOR UNCAUGHT EXCEPTION
  // process.exit(1);//This is a very abrupt way of ending the program, because this will immediately abort all the requests that are currently still running or pending
  //GRACEFULLY WAY OF SHUTTING DOWN, WHERE WE FIRST CLOSE THE SERVER, AND ONLY AFTER WE SHUT DOWN THE APPLCIATION
  //By doing that we give time the server time to finish all the request that are still pending, or being yhandled at the time
  //and only after that the server is actually killed
  //USUALLY ON THE PRODUCTION APP ON THE WEB SERVER, we will have some tool in place that restart the application right after it crashes
  //Or also some of the platform that host node.js will automatically do taht on thei own
  server.close(() => {
    process.exit(1);
  });
});
