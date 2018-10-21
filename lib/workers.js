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
const logs = require('./logs')

const workers = {};

//init
workers.init = function(){
  workers.checkLoop();
  //workers.logLoop();
  workers.compressLoop();
  debug('\x1b[32m%s\x1b[0m','workers started')
}

//loop section
workers.checkLoop = function(){
  setInterval(function(){
    workers.gatherChecks()
  },1000 * 10)
}

workers.logLoop = function(){
  setInterval(function(){
    workers.logFile()
  },1000 * 5)
}

workers.compressLoop = function(){
  setInterval(function(){
    workers.compressFile()
  },1000 * 3600 * 24)
}

//gather data and fire for logging and commpressing
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

//validate checks
workers.validateChecks = function(currentReading,readData){
  return new Promise((resolver,reject) => {
    readData = _helpers.parseIntoJSON(readData)
    let token = typeof(readData.token) == 'string' && readData.token.length > 0 ? readData.token : false;
    let email = typeof(readData.email) == 'string' && readData.email.length > 0 ? readData.email : false;
    let expraTime = typeof(readData.expraTime) == 'number' ? readData.expraTime : false;
    if (token && email && expraTime){
      resolver(workers.perfomCheck(currentReading,readData))
    }else{
      //debug('validation error')
      reject('validation error')
    }
  })
}

//autotomated activities logging in here
workers.perfomCheck = function(currentReading,readData){
    return new Promise(function(resolve,reject){
      if (readData.expraTime < Date.now()){
      workers.logFile('tokens',currentReading,function(err){
        if (!err){
          resolve([currentReading,readData])
        }else{
          reject(err)
        }
      })
    }else{
      Promise.break;
    }
    })
.then((data)=>{
  let readData = data[1];
  let currentReading = data[0];
  return new Promise((resolve,reject) => {
  if (readData.expraTime < Date.now()){
     dataLib.delete('tokens',currentReading,function(err){
       if (!err){
         resolve([err,readData])
       }else{
         reject()
       }
    })
  }

})
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
          resolver(['tokens',readData.token])
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

//log files
workers.logFile = function(dir,fileName,callback){
  //validate data
  dir = typeof(dir) == 'string' && dir.length > 0 ? dir : false;
  fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;

  if (dir && fileName){
    return new Promise(function(resolve,reject){
      logs.logFiles(fileName,function(err){
        if (!err){
          resolve(callback(false))
        }else{
          reject(callback(err))
        }
      })
    })
  }else{
    debug('error while loging to the file')
  }
}

//compress log files and delete compressed files
workers.compressFile =  function(){
    logs.readDir('',async function(readDir){
      let fileName;
      for (let i= 0; i< readDir.length; i++){
        if (/.json$/.test(readDir[i])){
        await new Promise( function(resolve,reject){
        fileName = readDir[i].replace('.json','')
        logs.read(fileName, function(err,readlogs){
          if (!err){
              resolve(logs.compressFile(readlogs,fileName,function(err){
                if (!err){
                  resolve(err)
                }else{
                  reject(err)
                }
            }))
          }else{
            reject('err')
          }
        })
        //resolve(logs.compressFile)

        })

      }
    }
  })
}


module.exports = workers;
