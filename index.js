/*
 *  Author:
 *  Date: 1:02 pm wed-oct3-18
 *  // TODO:
 *  // NOTE:
*/

const server = require('./lib/server');
const workers = require('./lib/workers');

const app = {};

app.init = function(){
  server.init();
  workers.init();
}

app.init();

module.exports = app;
