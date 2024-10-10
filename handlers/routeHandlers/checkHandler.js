/**
 * Title: Check Handler
 * Description: This Handlers handles the check routes
 * Author: AJ Jiad
 * Date: 4/10/2024
 */

//dependencies
const data = require("../../lib/data");
const { parseJSON, createRandomString } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("../../helpers/environments");

const handler = {};

handler.checkHandler = (requestProperties, callBack) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callBack);
  } else {
    callBack(405);
  }
};

handler._check = {};

handler._check.post = (requestProperties, callBack) => {
  //validate inputs
  const protocal =
    typeof requestProperties.body.protocal === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocal) > -1
      ? requestProperties.body.protocal
      : false;

  const url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  const timeOutSeconds =
    typeof requestProperties.body.timeOutSeconds === "number" &&
    requestProperties.body.timeOutSeconds % 1 === 0 &&
    requestProperties.body.timeOutSeconds >= 1 &&
    requestProperties.body.timeOutSeconds <= 5
      ? requestProperties.body.timeOutSeconds
      : false;

  //logic implement
  if (protocal && url && method && successCodes && timeOutSeconds) {
    const token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    //lookup the user phone by reading the token
    data.read("tokens", token, (err1, tokenData) => {
      if (!err1 && tokenData) {
        let userPhone = parseJSON(tokenData).phone;
        //lookup the user data
        data.read("users", userPhone, (err2, userData) => {
          if (!err2 && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);

                const userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                if (userChecks.length < maxChecks) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone,
                    protocal,
                    url,
                    method,
                    successCodes,
                    timeOutSeconds,
                  };
                  //save the object
                  data.create("checks", checkId, checkObject, (err3) => {
                    if (!err3) {
                      //add check id to the users object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      //save the new user data
                      data.update("users", userPhone, userObject, (err4) => {
                        if (!err4) {
                          //return the new check id to the user
                          callBack(200, checkObject);
                        } else {
                          callBack(500, {
                            error: "There was a problem in server!!",
                          });
                        }
                      });
                    } else {
                      callBack(500, {
                        error: "There was a problem in server!!",
                      });
                    }
                  });
                } else {
                  callBack(401, {
                    error: "User already reached max check limit!",
                  });
                }
              } else {
                callBack(403, {
                  error: "Authentication Error!",
                });
              }
            });
          } else {
            callBack(403, {
              error: "User not found!",
            });
          }
        });
      } else {
        callBack(403, {
          error: "Authentication Error!",
        });
      }
    });
  } else {
    callBack(400, {
      error: "You have a problem in your Request!",
    });
  }
};

handler._check.get = (requestProperties, callBack) => {
  //check the phone id if valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    //lookup the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callBack(200, parseJSON(checkData));
            } else {
              callBack(403, {
                error: "Anothentication Error!!",
              });
            }
          }
        );
      } else {
        callBack(500, {
          error: "There was a problem in server!!",
        });
      }
    });
  } else {
    callBack(400, {
      error: "There was a problem in request!!",
    });
  }
};

handler._check.put = (requestProperties, callBack) => {
  //validate inputs
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  //validate inputs
  const protocal =
    typeof requestProperties.body.protocal === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocal) > -1
      ? requestProperties.body.protocal
      : false;

  const url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  const timeOutSeconds =
    typeof requestProperties.body.timeOutSeconds === "number" &&
    requestProperties.body.timeOutSeconds % 1 === 0 &&
    requestProperties.body.timeOutSeconds >= 1 &&
    requestProperties.body.timeOutSeconds <= 5
      ? requestProperties.body.timeOutSeconds
      : false;

  if (id) {
    if (protocal || url || method || successCodes || timeOutSeconds) {
      data.read("checks", id, (err1, checkData) => {
        if (!err1 && checkData) {
          const checkObject = parseJSON(checkData);

          const token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;

          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocal) {
                  checkObject.protocal = protocal;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeOutSeconds) {
                  checkObject.timeOutSeconds = timeOutSeconds;
                }

                //store the checkObject
                data.update("checks", id, checkObject, (err2) => {
                  if (!err2) {
                    callBack(200, { error: "success!" });
                  } else {
                    callBack(500, {
                      error: "There was a server side error!!",
                    });
                  }
                });
              } else {
                callBack(403, {
                  error: "Authentication Error!",
                });
              }
            }
          );
        } else {
          callBack(500, {
            error: "There is a problem in server side!!",
          });
        }
      });
    } else {
      callBack(400, {
        error: "YOU must provide at least one field to update!",
      });
    }
  } else {
    callBack(400, {
      error: "There was a problem in request!!",
    });
  }
};

handler._check.delete = (requestProperties, callBack) => {
  //check the phone id if valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    //lookup the check
    data.read("checks", id, (err1, checkData) => {
      if (!err1 && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              //delete the check data
              data.delete("checks", id, (err2) => {
                if (!err2) {
                  data.read(
                    "users",
                    parseJSON(checkData).userPhone,
                    (err3, userData) => {
                      if (!err3 && userData) {
                        let userChecks =
                          typeof userData.checks === "object" &&
                          userObject.checks instanceof Array
                            ? userObject.checks
                            : [];

                        //remove the deleted check id from user's list of checks
                        let checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          //resave the user data
                          userObject.checks = userChecks;
                          data.update(
                            "users",
                            userChecks.phone,
                            userObject,
                            (err4) => {
                              if (!err4) {
                                callBack(200,{success:'successfully Deleted'});
                              } else {
                                callBack(500, {
                                  error: "Server side Error!!",
                                });
                              }
                            }
                          );
                        }
                      } else {
                        callBack(500, {
                          error: "Check is not found in user!!",
                        });
                      }
                    }
                  );
                } else {
                  callBack(500, {
                    error: "Server side Error!!",
                  });
                }
              });
            } else {
              callBack(403, {
                error: "Anothentication Error!!",
              });
            }
          }
        );
      } else {
        callBack(500, {
          error: "There was a problem in server!!",
        });
      }
    });
  } else {
    callBack(400, {
      error: "There was a problem in request!!",
    });
  }
};

module.exports = handler;
