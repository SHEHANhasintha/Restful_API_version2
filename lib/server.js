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
const availableItems = require('./availableItem')
const orders = require('./orders')
const logout = require('./logout')
const purchase = require('./paymentHandling')
const manupiulate = require('./manupiulate')
const error = require('./error')
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
    console.log('hereeeeeeee',trimedPath)

    //take data varibles and assign them into an object
    //available method list
    let availablepath = ['post','get','put','del']
    //validate path
    let reg = new RegExp("^.*\.(jpg|JPG|gif|GIF|doc|DOC|pdf|css|js)$");
    //console.log(reg.test(trimedPath),trimedPath)
    let requestHandler = server.router[trimedPath] !== undefined  ? server.router[trimedPath] : handlers.notFound;
    requestHandler = trimedPath.indexOf('public/') > -1 && reg.test(trimedPath) ? handlers.public : requestHandler;
    console.log(trimedPath.indexOf('public/jsManupiulation') > -1,trimedPath)
    requestHandler = trimedPath.indexOf('public/jsManupiulation') > -1 && reg.test(trimedPath) ? manupiulate.public.js : requestHandler;

    //validate path

    
    //add some regex to recodnize error situation
    //buffer = helpers.parseHeader(buffer);
    console.log(buffer,'buffer');
    let passingdata = {
      'urlParsed' : urlParsed,
      'path' : path,
      'trimedPath' : trimedPath,
      'method' : method,
      'headers' : headers,
      'queryString' : queryString,
      'payload' : helpers.parseIntoJSON(buffer)
    }
    console.log(passingdata)
    //console.log(passingdata,"passingdata")

    //take the responce data and send through the router // method:requestHandler(...,callback)
    //requestHandler
    requestHandler(passingdata,function(statusCode,payload,contentType){
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      //console.log(statusCode,contentType == 'html')
      //console.log(payload,contentType,(contentType == 'JSON'));
      let payloadString = NaN;
      if (contentType == 'JSON'){
        res.setHeader('Content-Type','application/json');
        payload = typeof(payload) == 'object' ? payload : {};
        payloadString = JSON.stringify(payload);

        payloadString = payloadString.trim();
        //console.log(payloadString,'dann')
      }

      if (contentType == 'js'){
        console.log("payload got it")
        res.setHeader('Content-Type','text/javascript');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }

      if (contentType == 'html'){
        res.setHeader('Content-Type','text/html');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }

      if (contentType == 'jpeg'){
        res.setHeader('Content-Type','image/jpeg');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if (contentType == 'png'){
        res.setHeader('Content-Type','image/png');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if (contentType == 'ico'){
        res.setHeader('Content-Type','image/ico');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if (contentType == 'svg'){
        res.setHeader('Content-Type','image/svg');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if (contentType == 'css'){
        res.setHeader('Content-Type','text/css');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if (contentType == 'favicon'){
        res.setHeader('Content-Type','image/x-icon');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if (contentType == 'plain'){
        res.setHeader('Content-Type','plain');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
      //console.log(statusCode,payloadString,'lllll')
      res.writeHead(statusCode);
      //res.writeHead(payloadString);
      //document.write(payloadString);
      res.end(payloadString);
      if (statusCode==200){
        console.log('\x1b[33m%s\x1b[0m',`${method} /${path} :${statusCode}`);
      }else{
        console.log('\x1b[33m%s\x1b[0m',`${method} /${path} :${statusCode}`);
      }
      })
  })
}

server.router = {
  '' : handlers.index,
  'api/users' : handlers.users,
  'api/tokens' : handlers.tokens,
  'validates/validates' : handlers.validation,
  'api/logout' : logout.users,
  'items/availableItems' : availableItems.gui.available,
  'orders/orders' : orders.item,
  'buy/purchase' : purchase.pay,
  'items/availableItems/all' : availableItems.all.get,
  'items/availableItems/get' : availableItems.get,
  'items/availableItems/new' : availableItems.available,
  'api/orders' : orders.item,
  'api/buyNow' : purchase.pay,
  'api/token/get' : handlers.tokens,
  

  'account/create' : handlers.gui.createAccount,
  'order/edit' : orders.gui.edit,
  'account/edit' : handlers.gui.editAccount,
  'payment' :  purchase.gui.pay,
  'successTransaction' : purchase.gui.success,
  'discription' : orders.gui.discription,

  'session/delete' : logout.gui.logout,
  'session/create' : handlers.gui.login,
  'favicon' : handlers.gui.favicon,

  'orders/dashboard' : orders.gui.dashboard,
  'error' : error.gui.error

}

module.exports = server;
