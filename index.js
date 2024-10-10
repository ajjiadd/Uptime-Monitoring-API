/*
Title: Project Initial file
Description: Initial file to start the node server and workers
Author: AJ Jiad
Date: 07/10/2024

Important Command of this Project:
    1. npm install lodash
    2. Create the Structure of this API
    3. npm install -g nodemon
    4. nodemon index {for running the server on "Thunder Client"}

*/

//dependencies

const server = require("./lib/server");
const worker = require("./lib/worker");
//const {sendTwilioSms} = require('./helpers/notifications');

//app object - module scaffolding
const app = {};

app.init = ()=>{

  //start the server
  server.init();

  //start the workers
  worker.init();


};

app.init()



module.exports = app;
