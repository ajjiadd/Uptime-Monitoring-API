/**
 * Title: Utilities
 * Description: Important utility functions
 * Author: AJ Jiad
 * Date: 2/10/2024
 */
const crypto = require("crypto");
const environments = require("./environments");

const utilities = {};

//parse JSON string to object
utilities.parseJSON = (jsonString) => {
  let output;

  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }

  return output;
};

//hash string
utilities.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", environments.secretKey)
      .update(str)
      .digest("hex");
    return hash;
  }
  return false;
};

//Create random string
utilities.createRandomString = (strlength) => {
  let length = strlength;
  length = typeof strlength === "number" && strlength > 0 ? strlength : false;

  if (length) {
    let possibleCharacters = "abcdefghijklmnopqrstuvwxyz1234567890";
    let output = "";
    for (let i = 1; i <= length; i += 1) {
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      output += randomCharacter;
    }
    return output;
  }
  return false;
};

module.exports = utilities;
