/*
 *  Author:
 *  Date: 1:02 pm wed-oct3-18
 *  // TODO:
 *  // NOTE:
*/

const http = require('http');
const https = require('https');
const config = require('./config');
const url = require('url');
const path = require('path');
const handlers = require('./handlers');
const helpers = require('./helpers');
const { StringDecoder } = require('string_decoder');
const server = {}
server.init = function(){
    server.httpServer.listen(config.httpPort,function(err){
      if (err){
        console.log(err);
      }else{
        console.log('\x1b[33m%s\x1b[0m',`server is now listening to ${config.httpPort}`)
      }
    })

    server.httpsServer.listen(config.httpsPort,function(err){
      if (err){
        console.log(err);
      }else{
        console.log('\x1b[33m%s\x1b[0m',`server is now listening to ${config.httpsPort}`)
      }
    })
}

server.httpServer = http.createServer(function(req,res){
  server.serverFunctionality(req,res);
})

server.httpsServer = https.createServer(function(req,res){
  server.serverFunctionality(req,res);
})

server.serverFunctionality = function(req,res){
  let urlParsed = url.parse(req.url,true);
  let path = urlParsed.pathname;
  let trimedPath =  path.replace(/^\/+|\/+$/g,'');
  let method = req.method.toLowerCase();
  let headers = req.headers;
  let queryString = urlParsed.query;
  let decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data',function(data){
    buffer += decoder.write(data);

  })

  req.on('end',function(data){
    buffer += decoder.end();


    //take data varibles and assign them into an object
    //available method list
    let availableMethod = ['push','get','put','del']
    //validate path
    let requestHandler = server.router[trimedPath] !== undefined  ? server.router[trimedPath] : handlers.notFound;
    let passingdata = {
      'urlParsed' : urlParsed,
      'path' : path,
      'trimedPath' : trimedPath,
      'method' : method,
      'headers' : headers,
      'queryString' : queryString,
      'payload' : helpers.parseIntoJSON(buffer)
    }

    //take the responce data and send through the router // method:requestHandler(...,callback)
    //requestHandler
    requestHandler(passingdata,function(statusCode,payload){
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      payload = typeof(payload) == 'object' ? payload : {};
      var payloadString = JSON.stringify(payload);
      res.setHeader('Content-type','application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      //console.log('respond: ',statusCode,'\n payload :', payloadString);
      if (statusCode==200){
        console.log('\x1b[33m%s\x1b[0m',`${method} /${path} :${statusCode}`);
      }else{
        console.log('\x1b[33m%s\x1b[0m',`${method} /${path} :${statusCode}`);
      }
      })
  })
}

server.router = {
  'notFound' : handlers.notFound,
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'validates' : handlers.validation
}

module.exports = server;
