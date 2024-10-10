/**
 * Title: Sample Handler
 * Description: Sample Handler
 * Author: AJ Jiad
 * Date: 20/09/2024
 */

const handler = {};

handler.sampleHandler = (requestProperties, callBack) => {
  console.log(requestProperties);
  callBack(200, {
    message: "This is a sample url",
  });
};

module.exports = handler;
