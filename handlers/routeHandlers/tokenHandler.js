/**
 * Title: Token Handler
 * Description: This Handlers handles the token routes
 * Author: AJ Jiad
 * Date: 3/10/2024
 */

//dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { createRandomString } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");

const handler = {};

handler.tokenHandler = (requestProperties, callBack) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callBack);
  } else {
    callBack(405);
  }
};

//sub-token handler methods
handler._token = {};

handler._token.post = (requestProperties, callBack) => {
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

  if (phone && password) {
    data.read("users", phone, (err1, userData) => {
      let hashedPassword = hash(password);

      if (hashedPassword === parseJSON(userData).password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone,
          id: tokenId,
          expires,
        };

        //store the token
        data.create("tokens", tokenId, tokenObject, (err2) => {
          if (!err2) {
            callBack(200, tokenObject);
          } else {
            callBack(500, {
              error: "There was a problem in server!",
            });
          }
        });
      } else {
        callBack(400, {
          error: "Password is not valid!",
        });
      }
    });
  } else {
    callBack(400, {
      error: "You have a problem in your request!",
    });
  }
};

handler._token.get = (requestProperties, callBack) => {
  //check the phone id if valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    //Lookup the token
    data.read("tokens", id, (err, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callBack(200, token);
      } else {
        callBack(404, {
          error: "Requested token was not found! Please Check it",
        });
      }
    });
  } else {
    callBack(404, {
      error: "Requested token was not found!",
    });
  }
};

//update token
handler._token.put = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? requestProperties.body.extend
      : false;

  if (id && extend) {
    data.read("tokens", id, (err1, tokenData) => {
      let tokenObject = parseJSON(tokenData);
      if (tokenObject.expires > Date.now()) {
        tokenObject.expires > Date.now() + 60 * 60 * 1000;

        //store the updated token
        data.update("tokens", id, tokenObject, (err2) => {
          if (!err2) {
            callBack(200);
          } else {
            callBack(500, { error: "Could not update the token" });
          }
        });
      } else {
        callBack(400, {
          error: "Token already expired!",
        });
      }
    });
  } else {
    callBack(400, {
      error: "You have a problem in your request!",
    });
  }
};

handler._token.delete = (requestProperties, callBack) => {
  //check the phone number if valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    //lookup the user
    data.read("tokens", id, (err1, tokenData) => {
      if (!err1 && tokenData) {
        data.delete("tokens", id, (err2) => {
          if (!err2) {
            callBack(200, {
              message: "Token was successfully deleted!",
            });
          } else {
            callBack(500, {
              error: "There was a server side error!",
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
    callBack(400, {
      error: "There was a problem in your request!",
    });
  }
};


handler._token.verify = (id, phone, callBack) =>{
    data.read('tokens', id, (err, tokenData)=>{
        if(!err && tokenData){

            if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()){
                callBack(true);
            }else{
                callBack(false)
            }

        }else{
            callBack(false)
        }
    });
}


module.exports = handler;
