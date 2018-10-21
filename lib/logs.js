/*
 *
 *
 *
*/

const zlib = require('zlib')
const path = require('path')
const fs = require('fs')
const dataLib = require('./data')
const _helpers = require('./helpers')
const util = require('util')
const debug = util.debuglog('workers');

const logs = {}
logs._baseDir = path.join(__dirname,'/../.logs');

logs.compressFile = (string,fileName,callback) => {
  return new Promise(function(resolve,reject){
    logs.read(fileName,function(err,readData){
          if (!err){
            resolve([string,fileName,readData])
          }else{
            reject(callback({'error' : 'could not read the file'}))
          }
    })
  })

.then((dataStream) => {
    let string = dataStream[0];
    let fileName = dataStream[1];
    let readData = dataStream[2];
    return new Promise((resolve,reject) => {
      zlib.deflate(readData,function(err,buffer){
        if (!err){
          resolve([string,fileName,readData,buffer])
        }else{
          reject(callback({'error' : 'could not compress the file'}))
        }
      })
    })
  }
).then((dataStream) => {
  let string = dataStream[0];
  let fileName = dataStream[1];
  let readData = dataStream[2];
  let buffer = dataStream[3];
  return new Promise((resolve,reject) => {
    logs.createFile('protected' +'/'+ fileName +'.'+ Date.now() , '.gz',buffer,function(err){
      if (!err){
        resolve(fileName)
      }else{
        reject(callback({'error' : 'could not create the file'}))
      }
    })
  })
}).then((dataStream) =>{
  return new Promise(function(resolve,reject){
  logs.delete('',dataStream,function(err){
    if (!err){
      resolve(callback(false))
    }else{
      reject(callback('failed to delete file'))
    }
  })
})
})
}

logs.logFiles = function(fileName,callback){
  return new Promise(function(resolve,reject){
    dataLib.read('tokens',fileName,function(err,data){
      if (!err){
        logs.createFile(fileName,'.json',data,function(err){
          if (!err){
            resolve(callback(false))
          }else{
            reject(callback(err))
          }
        })
      }else{
        reject(callback(err))
      }
    })
  })
}

//readthe dir
logs.readDir = function(dir,callback){
  fs.readdir(logs._baseDir+'/'+dir,function(err,dirData){
    if (!err && dirData){
      callback(dirData)
    }else{
      callback(err)
    }
  })
}

//read from a file
logs.read = function(fileName,callback){
  fs.readFile(logs._baseDir+'/'+fileName+'.json','utf8',function(err,readData){
    if (!err){
      callback(false,readData);
    }else{
      callback({'error' : 'file opening error'})
    }
  })
}


//write into a file
logs.createFile = function(fileName,format,string,callback){
  fs.open(logs._baseDir+'/'+fileName+Date.now()+format,'wx',function(err,fileDiscriptor){
    if (!err && fileDiscriptor){
      fs.writeFile(fileDiscriptor,string,function(err){
        if (!err){
          fs.close(fileDiscriptor, function(err){
            if (!err){
              callback(false);
            }else{
              callback({'error' : 'error occured => file closing'})
            }
          })
        }else{
          callback({'error' : 'error occured => file writting'})
        }
      })
    }else{
      callback({'error' : 'error occured => file opening'})
    }
  })
}

//update file data
// NOTE: This is not about adding more to a file insterd of that clear the file and rewrite.
logs.updateFile = function(dir,fileName,string,callback){
  fs.open(logs._baseDir+dir+'/'+fileName+'.json','a',function(err,fileDiscriptor){
    if (!err && fileDiscriptor){
      fs.truncate(logs._baseDir+dir+'/'+fileName+'.json',function(err){
        if (!err){
          let stringReady = JSON.stringify(string);
          fs.writeFile(fileDiscriptor,stringReady,function(err){
            if (!err){
              callback(false);
            }else{
              callback({'error' : 'error occured => file writting'})
            }
          })
        }else{
          callback({'error' : 'error occured => file truncating'})
        }
      })
    }else{
      callback({'error': 'error occured => file opening'})
    }
  })
}

//delete file
logs.delete = function(dir,fileName,callback){
  fs.unlink(logs._baseDir+'/'+fileName+'.json',function(err){
    if (!err){
      callback(false);
    }else{
      callback({'error':'error occured => file deleting'})
    }
  })
}

module.exports = logs;
