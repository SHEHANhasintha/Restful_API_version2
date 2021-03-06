/*
 *  Author:
 *  Date: 1:02 pm wed-oct3-18
 *  // TODO:
      //create a method for wrtting data into any given file with the @PARAM: dir,string,callback @method: POST REQUEST => CREATE FILE
 *  // NOTE:

(data[object that pass into oreder],callback)
 |~ @data__
  |- readDir      ()
  |- read         ()
  |- createFile   ()
  |- updateFile   ()
  |- delete       ()
  |- renameFile   ()


*/

const fs = require('fs');
const path = require('path');
const _helpers = require('./helpers');

const data = {};
data._baseDir = path.join(__dirname,'/../.data/')

//readthe dir
data.readDir = function(dir,callback){
  //console.log(data._baseDir+dir+'/',dir)
  fs.readdir(data._baseDir+dir+'/',function(err,dirData){
    if (!err && dirData){
      callback(dirData)
    }else{
      callback(err)
    }
  })
}

//read from a file
data.read = function(dir,fileName,callback){
  return new Promise(function(resolve,reject){
    //console.log(data._baseDir+dir+'/'+fileName+'.json')
    fs.readFile(data._baseDir+dir+'/'+fileName+'.json','utf8',function(err,readData){
      if (!err && readData){
        resolve(callback(false,readData));
      }else{
        reject({'error' : 'file opening error'});
      }
    })
  }).catch((err) => {
    callback(err)
  })
}


//write into a file
data.createFile = function(dir,fileName,string,callback){
  fs.open(data._baseDir+dir+'/'+fileName+'.json','wx',function(err,fileDiscriptor){
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
data.updateFile = function(dir,fileName,string,callback){
  return new Promise(function(resolve,reject){
  fs.open(data._baseDir+dir+'/'+fileName+'.json','a',function(err,fileDiscriptor){
    resolve([err,fileDiscriptor])
    })
  })
  .then(function(arr){
    let err = arr[0]
    let fileDiscriptor = arr[1]
    if (!err && fileDiscriptor){
    return new Promise(function(resolve,reject){
      fs.truncate(data._baseDir+dir+'/'+fileName+'.json',function(err){
          resolve([err,fileDiscriptor])
    })
      })
    }else{
      callback({'error': 'error occured => file opening'})
    }
  })
  .then(function(arr){
    let err = arr[0]
    let fileDiscriptor = arr[1]
    if (!err){
      let stringReady = JSON.stringify(string);
      return new Promise(function(resolve,reject){
        fs.writeFile(fileDiscriptor,stringReady,function(err){
          if (!err){
            resolve(fileDiscriptor);
          }else{
            reject(callback({'error' : 'error occured => file writting'}))
          }
        })
      })
    }else{
      resolve(callback({'error' : 'error occured => file truncating'}))
    }
  }).then(function(fileDiscriptor){
    return new Promise(function(resolve,reject){
      fs.close(fileDiscriptor,function(err){
        if (!err){
          resolve(callback(false))
        }else{
          reject(callback({'error' : 'error occured while updating data'}))
        }
      })
    })
  })


}

//delete file
data.delete = function(dir,fileName,callback){
  return new Promise(function(resolve,reject){
    fs.unlink(data._baseDir+dir+'/'+fileName+'.json',function(err){
      if (!err){
        resolve(callback(false));
      }else{
        resolve(callback({'error':'error occured => file deleting'}))
      }
    })
  })
}

//rename a file
data.renameFile = function(dir,fileName,newFileName,callback){
  fs.rename(data._baseDir+dir+'/'+fileName+'.json',newFileName + '.json',function(err){
    if (!err){
      callback(false)
    }else{
      callback({'error' : 'error renaming file'})
    }
  })
}

module.exports = data;
