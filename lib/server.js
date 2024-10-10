/*
Title: Uptime Monitoring
Description: A RESTful API to monitor up or down time of user defined links
Author: AJ Jiad
Date: 20/09/2024

Important Command of this Project:
    1. npm install lodash
    2. Create the Structure of this API
    3. npm install -g nodemon
    4. nodemon index {for running the server on "Thunder Client"}

*/

//dependencies
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes");
const environment = require("../helpers/environments");

//const {sendTwilioSms} = require('./helpers/notifications');

//app object - module scaffolding
const server = {};

//for testing && @TODO remove later
/*
sendTwilioSms('01406208228', 'hello world', (err)=>{
  console.log(`this is the error`, err);
});
 */ 


//testing file system {Write Data}
/*
data.create('test', 'newfile3', {name: 'AJ', position: 'Web-developer'}, (err) => {
   console.log('Error was', err);
});
 */

//testing file system {Read Data}
/*
data.read('test', 'newfile', (err, data)=>{
    console.log(err, data);
});
*/

//testing file system {Update Data}
/*
data.update('test', 'newfile3', {name: 'Tanvir', position:'Project-Management'}, (err)=>{
    console.log(err);
});
 */

//testing file system {Delete Data}
/*
data.delete('test', 'newfile3', (err)=>{
    console.log(err);
});

 */

//configuration

server.config = {
  port: 3000,
};



//create server
server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);
  createServerVariable.listen(environment.port, () =>{
    console.log(`lestening to port ${environment.port}`);
  });
};

//handle Request Response
server.handleReqRes = handleReqRes;

//start the server
server.init = ()=>{
    server.createServer();
};

module.exports = server;
