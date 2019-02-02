/*
 * logout
*/

const logout = {}
const _dataLib = require('./data');
const _helpers = require('./helpers')

logout.users = function(data,callback){
  const availableMethods = ['get'];
  let method = typeof(data.method) == 'string' && availableMethods.indexOf(data.method) > -1 ? data.method : false;
  if (method){
    logout.users[data.method](data,function(statusCode,err){
      callback(statusCode,err)
    })
  }else{
    callback(405,{'error':'method not allowed'})
  }
}

//get
logout.users.get = function(currentToken,callback){
  console.log(currentToken,'heyyy')
  let token = typeof(currentToken.headers.token) == 'string' && currentToken.headers.token.length == 20 ? currentToken.headers.token : false;

  if (token){
    _dataLib.read('tokens',token,function(err,tokenData){
      if (!err && tokenData){
        tokenData = _helpers.parseIntoJSON(tokenData)
        _dataLib.read('users',tokenData.email,async function(err,userData){
          userData = _helpers.parseIntoJSON(userData)
          if (!err && userData){
            for (let i=0; i<userData.tokens.length; i++){
              await _dataLib.delete('tokens',userData.tokens[i], async function(err){
                console.log('dddd')
                //continue
              })
            }

            userData.tokens = [];
            await _dataLib.updateFile('users',tokenData.email,userData,function(err){
              //continue
            })

            callback(200)
          }else{
            callback(400,{'error' : 'user not exist for this token'})
          }
        })
      }else{
        callback(400,{'error' : 'you are already logged out'})
      }
    })
  }else{
    callback(422,{'error' : 'invalid input'})
  }
}

logout.gui = {}

logout.gui.logout = function(data,callback){
  //reject no get method request
  if ((data.method) == 'get'){
    _helpers.getTemplate("logout",function(err,templateData){
      if (!err && templateData){
        let renderInfo = {

        }
        _helpers.universalRender(templateData,renderInfo,function(err,universalData){
          if (!err && universalData){
            callback(200,universalData,"html")
          }else{
            callback(500,"data rendering error at universalRender",'plain')
          }
        })
      }else{
        callback(500,"system Error occured at template Read",'plain')
      }
    })
  }else{
    callback(404,"invalid method",'plain')
  }
}

module.exports=logout;
