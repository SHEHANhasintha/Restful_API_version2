/*
 *  Author:
 *  Date: 1:02 pm wed-oct3-18
 *  // TODO:
      //create a method for wrtting data into any given file with the @PARAM: dir,string,callback @method: POST REQUEST => CREATE FILE
 *  // NOTE:
*/

const fs = require('fs');
const path = require('path');

const data = {};
data._baseDir = path.join(__dirname,'/../.data/')

//readthe dir
data.readDir = function(dir,callback){
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

  fs.readFile(data._baseDir+dir+'/'+fileName+'.json','utf8',function(err,readData){
    if (!err){
      callback(false,readData);
    }else{
      callback({'error' : 'file opening error'})
    }
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
  fs.open(data._baseDir+dir+'/'+fileName+'.json','a',function(err,fileDiscriptor){
    if (!err && fileDiscriptor){
      fs.truncate(data._baseDir+dir+'/'+fileName+'.json',function(err){
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
data.delete = function(dir,fileName,callback){
  fs.unlink(data._baseDir+dir+'/'+fileName+'.json',function(err){
    if (!err){
      callback(false);
    }else{
      callback({'error':'error occured => file deleting'})
    }
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
