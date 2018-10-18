/*
 *  Author:
 *  Date: 1:02 pm wed-oct3-18
 *  // TODO:
        // create a email verification method as a background worker
 *  // NOTE:
*/

const util = require('util')
const debug = util.debuglog('workers');
const dataLib = require('./data')
const path = require('path')
const _helpers = require('./helpers')


const workers = {};

//init
workers.init = function(){
  workers.loop();
  //workers.rotateLogs();
  //workers.loopRotateLogs();
  debug('\x1b[32m%s\x1b[0m','workers started')
}

workers.loop = function(){
  setInterval(function(){
    workers.gatherChecks()
  },1000 * 2)
}



workers.gatherChecks = function(folder){
  dataLib.readDir('tokens',async function(readFiles){
    for (let i=0; i<readFiles.length; i++){
      let currentReading = readFiles[i]
      currentReading = currentReading.replace('.json','')
      await new Promise((resolver,reject) => {
         dataLib.read('tokens',currentReading,function(err,readData){
          if (!err){
            resolver(workers.validateChecks(currentReading,readData))
          }else{
            reject('error occured')
          }
        })
      })
  }
})
}

workers.validateChecks = function(currentReading,readData){
  return new Promise((resolver,reject) => {
    readData = _helpers.parseIntoJSON(readData)
    let token = typeof(readData.token) == 'string' && readData.token.length > 0 ? readData.token : false;
    let email = typeof(readData.email) == 'string' && readData.email.length > 0 ? readData.email : false;
    let expraTime = typeof(readData.expraTime) == 'number' ? readData.expraTime : false;
    if (token && email && expraTime){
      resolver(workers.perfomCheck(currentReading,readData))
    }else{
      debug('validation error')
      reject('validation error')
    }
  })
}

workers.perfomCheck = function(currentReading,readData){
  return new Promise((resolve,reject) => {
  if (readData.expraTime < Date.now()){
     dataLib.delete('tokens',currentReading,function(err){
       if (!err){
         resolve([err,readData])
       }else{
         reject(err)
       }
    })
  }

}).then(
 function(data){
  let err = data[0]
  let readData = data[1]
  let userDa = 0
  if (!err){
    return new Promise((resolver,reject) => {
        dataLib.read('users',readData.email, function(err,userData){
             userData = _helpers.parseIntoJSON(userData);
             if (!err){
               resolver([userData,readData])
             }else{
               reject(err)
             }
          })
        }
        )
  }else{
    return err
  }
}
).then(function(data){
  let userData = data[0];
  let readData = data[1];
  if (!false){
    modifiedArr =_helpers.deleteArrItem(userData.tokens,readData.token)
    userData.tokens = modifiedArr
      return new Promise((resolver,reject) => {
        dataLib.updateFile('users',readData.email,userData,function(err){
          if (!err){
          debug(false)
          resolver(false)
        }else{
          reject(err)
        }
        })
      })
  }else{
    return 'error occured'
  }
})
}

workers.logFile = function(string){

}

workers.compressFiles = function(fileName){

}


module.exports = workers;
