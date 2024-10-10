/**
 * Title: Not Found Handler
 * Description: This page handles the notFoundHandler function method
 * Author: AJ Jiad
 * Date: 20/09/2024
 */

const handler = {};

handler.notFoundHandler = (requestProperties, callBack) => {
  callBack(404, {
    message: "This page was not found",
  });
};

module.exports = handler;
