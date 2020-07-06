/*
 *  Author:
 *  Date: 1:02 pm wed-oct3-18
 *  // TODO:
 *  // NOTE:
*/

const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

const app = {};

app.init = function(){
  server.init();
  workers.init();
  
  setTimeout(function(){
  	cli.init();
  },1000)
}

app.init();

module.exports = app;
