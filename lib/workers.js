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
  },1000 * 50)
}



workers.gatherChecks = function(folder){
  dataLib.readDir('tokens',function(readFiles){
    readFiles.forEach( function(currentReading){
      debug(Date.now(),'up here');
      currentReading = currentReading.replace('.json','')
        dataLib.read('tokens',currentReading,function(err,readData){
        if (!err){
          workers.validateChecks(currentReading,readData)
        }else{
          debug('error occured')
        }
      })
  })
})
}

workers.validateChecks = function(currentReading,readData){
  debug(Date.now(),'step 2 here');
  readData = _helpers.parseIntoJSON(readData)
  let token = typeof(readData.token) == 'string' && readData.token.length > 0 ? readData.token : false;
  let email = typeof(readData.email) == 'string' && readData.email.length > 0 ? readData.email : false;
  let expraTime = typeof(readData.expraTime) == 'number' ? readData.expraTime : false;
  if (token && email && expraTime){
    workers.perfomCheck(currentReading,readData)
  }else{
    debug('validation error')
  }
}

workers.perfomCheck = async function(currentReading,readData){
  debug(Date.now(),'step 3 here');
  if (readData.expraTime < Date.now()){
     dataLib.delete('tokens',currentReading,function(err){
      if (!err){

             dataLib.read('users',readData.email,function(err,userData){
              debug(Date.now(),'users here')

                userData = _helpers.parseIntoJSON(userData);
                //console.log(userData.tokens,readData.token)
                modifiedArr =_helpers.deleteArrItem(userData.tokens,readData.token)
                userData.tokens = modifiedArr
                  dataLib.updateFile('users',readData.email,userData,function(err){
                   debug(Date.now(),'down here');
                    debug(err)
                })

          })

      }else{
        debug(err)
      }
    })
  }

  }



workers.logFile = function(string){

}

workers.compressFiles = function(fileName){

}


module.exports = workers;
