/**
 * Title: Routes
 * Description: This file contains all the routes for the application
 * Author: AJ Jiad
 * Date: 20/09/2024
 */

//dependencies
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandler");
const { userHandler } = require("./handlers/routeHandlers/userHandler");
const { tokenHandler } = require("./handlers/routeHandlers/tokenHandler");
const {checkHandler} = require("./handlers/routeHandlers/checkHandler");

//module scaffolding
const routes = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};

module.exports = routes;
