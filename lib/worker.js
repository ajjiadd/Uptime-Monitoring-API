/*
Title: Workers library
Description: workers related files
Author: AJ Jiad
Date: 7/10/2024
*/

//dependencies
const url = require("url");
const http = require("http");
const https = require("https");
const { sendTwilioSms } = require("../helpers/notifications");
const data = require("./data");
const { parseJSON } = require("../helpers/utilities");

//worker object - module scaffolding
const worker = {};

//lookup all the checks
worker.gatherAllChecks = () => {
  //get all the checks
  data.list("checks", (err1, checks) => {
    if (!err1 && checks && checks.length > 0) {
      checks.forEach((check) => {
        //read the  checkData
        data.read("checks", check, (err2, originalCheckData) => {
          if (!err2 && originalCheckData) {
            //pass the data to the check validator!
            worker.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log("Error reading check data from database");
          }
        });
      });
    }else{
      console.log("Error: no checks found");
    }
  });
};

//validate individual check data
worker.validateCheckData = (originalCheckData) => {
  let originalData = originalCheckData;
  if (originalCheckData && originalCheckData.id) {
    originalData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";

    originalData.lastChecked =
      typeof originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

      //pass the next process
      worker.performCheck(originalData);
  } else {
    console.log("Error: check was invalid or not properly formatted!");
  }
};

//perform check
worker.performCheck = (originalCheckData) => {
  //prepare the initial check outcome
  let checkOutCome = {
    error: false,
    responseCode: false,
  };

  //mark the outcome has not been sent yet
  let outcomeSent = false;

  //parse the hostname & full url from original data
  const parseUrl = url.parse(
    `${originalCheckData.protocal}://${originalCheckData.url}`,
    true
  );
  const hostName = parseUrl.hostName;
  const path = parseUrl.path;

  //construct the request
  const requestDetails = {
    protocal: (originalCheckData.protocal + ":"),
    hostName: hostName,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeOutSeconds * 10000,
  };

  const protocalToUse = originalCheckData.protocal === "http" ? http : https;

  const req = protocalToUse.request(requestDetails, (res) => {
    //grap the status of the response
    const status = res.statusCode;
    

    //update the  check outcome and pass to the next process
    checkOutCome.responseCode = status;
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutCome);
      outcomeSent = true;
    }
  });

  //handle request error
  req.on("error", (e) => {
    checkOutCome = {
      error: true,
      value: e,
    };

    //update the  check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutCome);
      outcomeSent = true;
    }
  });

  //req send timeout
  req.on("timeout", () => {
    checkOutCome = {
      error: true,
      value: "timeout",
    };
    //update the  check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutCome);
      outcomeSent = true;
    }
  });

  //end the request
  req.end();
};

//save check outcome to database and send to next process
worker.processCheckOutcome = (originalCheckData, checkOutCome) => {
  //check if check outcome is up or down
  let state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1
      ? "up"
      : "down";

  //deside wheather we should alert the user or not
  const alertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

  //update the check data
  let newCheckData = originalCheckData;

  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  //update the check to disk
  data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        //send the checkdata to next process
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Alert is not needed as there is no state change!");
      }
    } else {
      console.log("Error trying to save check data of one of the checks");
    }
  });
};

//send notifications sms to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
  let msg = `Alert: your check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocal
  }://${newCheckData.url} is currently ${newCheckData.state}`;

  sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (err) {
      console.log(`User was alerted to a status change via SMS: ${msg}`);
    } else {
      console.log("There was a problem sending sms to one of the user!");
    }
  });
};

//timer to execute the worker process once per minute
worker.loop = ()=>{
  setInterval(()=>{
    worker.gatherAllChecks();
  },8000);
};

// start the workers
worker.init = () => {
  //execute all the checks
  worker.gatherAllChecks();

  //call the loop so that checks continue
  worker.loop();
};




//exports
module.exports = worker;
