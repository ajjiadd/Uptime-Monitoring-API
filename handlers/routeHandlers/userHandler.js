/**
 * Title: User Handler
 * Description: This Handlers handles the user routes
 * Author: AJ Jiad
 * Date: 2/10/2024
 */

//dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");

const handler = {};

handler.userHandler = (requestProperties, callBack) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callBack);
  } else {
    callBack(405);
  }
};

handler._users = {};

handler._users.post = (requestProperties, callBack) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean" &&
    requestProperties.body.tosAgreement
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    //make sure that the user doesn't already exists
    data.read("users", phone, (err1) => {
      if (err1) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        //store the user to db
        data.create("users", phone, userObject, (err2) => {
          if (!err2) {
            callBack(200, { message: "User was created successfully!" });
          } else {
            callBack(500, {
              error: "could not create user!",
            });
          }
        });
      } else {
        callBack(500, {
          error: "There was a problem in server side!",
        });
      }
    });
  } else {
    callBack(400, {
      error: "you have a problem in your request",
    });
  }
};

handler._users.get = (requestProperties, callBack) => {
  //check the phone number if valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    //verify token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        //Lookup the user
        data.read("users", phone, (err, u) => {
          const user = { ...parseJSON(u) };
          if (!err && user) {
            delete user.password;
            callBack(200, user);
          } else {
            callBack(404, {
              error: "Requested user was not found! Please Check it",
            });
          }
        });
      } else {
        callBack(403, {
          error: "Authentication failure!",
        });
      }
    });
  } else {
    callBack(404, {
      error: "Requested user was not found!",
    });
  }
};

handler._users.put = (requestProperties, callBack) => {
  //check the phone number if vallid
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      //verify token
      let token =
        typeof requestProperties.headersObject.token === "string"
          ? requestProperties.headersObject.token
          : false;

      tokenHandler._token.verify(token, phone, (tokenId) => {
        if (tokenId) {
          //lookup the user
          data.read("users", phone, (err1, uData) => {
            const userData = { ...parseJSON(uData) };
            if (!err1 && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }

              //store to database
              data.update("users", phone, userData, (err2) => {
                if (!err2) {
                  callBack(200, {
                    message: "User wass updated successfully!",
                  });
                } else {
                  callBack(500, {
                    error: "There was a problem in the server side!",
                  });
                }
              });
            } else {
              callBack(400, {
                error: "You have a problem in your request!",
              });
            }
          });
        } else {
          callBack(403, {
            error: "Authentication failure!",
          });
        }
      });
    } else {
      callBack(400, {
        error: "You have a problem in your request!",
      });
    }
  } else {
    callBack(400, {
      error: "INVALID phone number. Please try again!",
    });
  }
};

handler._users.delete = (requestProperties, callBack) => {
  //check the phone number if valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    //verify token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        //lookup the user
        data.read("users", phone, (err1, userData) => {
          if (!err1 && userData) {
            data.delete("users", phone, (err2) => {
              if (!err2) {
                callBack(200, {
                  message: "User was successfully deleted!",
                });
              } else {
                callBack(500, {
                  error: "There wass a server side error!",
                });
              }
            });
          } else {
            callBack(500, {
              error: "There wass a server side error!",
            });
          }
        });
      } else {
        callBack(403, {
          error: "Authentication failure!",
        });
      }
    });
  } else {
    callBack(400, {
      error: "There was a problem in your request!",
    });
  }
};

module.exports = handler;
