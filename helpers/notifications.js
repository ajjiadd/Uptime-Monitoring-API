/**
 * Title: Notification Library (From ChatGPT)
 * Description: important function of notify users
 * Author: AJ Jiad
 * Date: 05/10/24
 */

//dependencies
const https = require("https");
const querystring = require("querystring");
const { twilio } = require("./environments");

//module scaffolding
const notifications = {};

//send sms to user using twilio api
notifications.sendTwilioSms = (phone, msg, callBack) => {
  //input validation
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? `+88${phone.trim()}`
      : false;

  const userMsg =
    typeof msg === "string" && msg.trim().length <= 1600 ? msg.trim() : false;

  if (!(userPhone && userMsg)) {
    return callBack("Error: Invalid input");
  }

  if (!twilio.accountSid || !twilio.authToken || !twilio.messagingServiceSid) {
    return callBack("Error: Twilio configuration is invalid");
  }

  const payload = {
    To: userPhone,
    MessagingServiceSid: twilio.messagingServiceSid,
    Body: userMsg,
  };

  //stringify the payload
  const stringifyPayload = querystring.stringify(payload);

  //configure the request details
  const requestDetails = {
    hostname: "api.twilio.com",
    method: "POST",
    path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
    auth: `${twilio.accountSid}:${twilio.authToken}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  //instantiate the request object
  const req = https.request(requestDetails, (res) => {
    //get the status of the sent request
    const status = res.statusCode;
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      //callback success
      if (status === 200 || status === 201) {
        callBack(false);
      } else {
        try {
          const errorData = JSON.parse(data);
          callBack(`Status code returned was ${status}: ${errorData.message}`);
        } catch (e) {
          callBack(`Status code returned was ${status}: ${data}`);
        }
      }
    });
  });

  req.on("error", (e) => {
    callBack(e);
  });

  req.write(stringifyPayload);
  req.end();
};

//export the module
module.exports = notifications;