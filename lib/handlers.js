/*
 *  Author:
 *  Date: 1:02 pm wed-oct3-18
 *  // TODO:
 *  // NOTE:
*/

const _data = require('./data')
const _helpers = require('./helpers')
const querystring = require('querystring')
const config = require('./config')

const handlers = {};

//ping
handlers.ping = function(data,callback){
  callback(200)
}

handlers.notFound = function(data,callback){
  callback(404,{'error' : `requested path not found`})
}

handlers.users = function(data,callback){
  const availableMethods = ['get','post','put','delete'];
  let method = typeof(data.method) == 'string' && availableMethods.indexOf(data.method) > -1 ? data.method : false;
  if (method){
    handlers.users[data.method](data,function(statusCode,err){
      callback(statusCode,err)
    })
  }else{
    callback(405,{'error':'method not allowed'})
  }
}

//post => the Registration
handlers.users.post = function(data,callback){
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.length > 0 ? data.payload.firstName : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.length > 0 ? data.payload.lastName : false;
  let emailReq = typeof(data.payload.email) == 'string' && /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(data.payload.email) ? data.payload.email : false;
  let phone = typeof(parseInt(data.payload.phone)) == 'number' && data.payload.phone.toString().length >= 9 ? data.payload.phone : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password ? data.payload.password : false;
  let address = typeof(data.payload.address) == 'string' && data.payload.address.length > 0 ? data.payload.address : false;

  if ((firstName || lastName) && emailReq && phone && password){
    //check weather the user already exist
    _helpers.crypto(function(crypt){
      email = crypt[emailReq]
      password = crypt[password]
    },emailReq,password)
    _data.read('users',email,function(err,userData){
        if (err){
            // if not create one
            let dataJsonReady = {
              'firstName' : firstName,
              'lastName' : lastName,
              'email' : email,
              'phone' : phone,
              'password' : password,
              'address' : address
            }
            dataJsonReady = _helpers.JSONIntoString(dataJsonReady)
            _data.createFile('users',email,dataJsonReady,function(err){
              if (!err){
                dataJsonReady = _helpers.parseIntoJSON(dataJsonReady)
                delete dataJsonReady.password
                dataJsonReady.email = emailReq
                callback(200,{'StoredData' : dataJsonReady})
              }else{
                callback(500,{'error':'internal server error while storing data'})
              }
            })

        }else{
          callback(409,{'error':'user already exist'})
        }
      })
  }else{
    callback(422,{'error' : 'incomplete data entry or invalid data entry'})
  }
}

//get user data
handlers.users.get = function(data,callback){
  let email = typeof(data.queryString.email) == 'string' && /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(data.queryString.email) ? data.queryString.email : false;
  let tokengiven = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
  if (email && tokengiven){
    handlers.tokens.verify(tokengiven,function(err,detail){
      if (!err){
          _helpers.crypto(function(crypt){
            emailReady = crypt[email]
          },email)
          _data.read('users',emailReady,function(err,userRead){
            if(!err){
              userRead = _helpers.parseIntoJSON(userRead)
              delete userRead.password
              callback(200,{'userData' : userRead})
            }else{
              callback(500,{'error' : 'internal server error'})
            }
          })
      }else{
        callback(422,{'error' : 'verification fail'})
      }
    })
  }else{
    callback(422,{'error':'invalid data entry'})
  }
}

//update user data
handlers.users.put = function(data,callback){
  let email = typeof(data.payload.email) == 'string' && /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(data.queryString.email) ? data.queryString.email : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.length > 0 ? data.payload.password : false;
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.length > 0 ? data.payload.firstName : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.length > 0 ? data.payload.lastName : false;
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.length > 0 ? data.payload.phone : false;
  let address = typeof(data.payload.address) == 'string' && data.payload.address.length > 0 ? data.payload.address : false;
  if (email && password && token || firstName || lastName || phone || address){
    handlers.tokens.verify(token,function(err,detail){
      if (email){
        _helpers.crypto(function(crypt){
          emailReady = crypt[email]
        },email)
      }
      if (password){
        _helpers.crypto(function(crypt){
          passwordReady = crypt[password]
        },password)
      }
      if (!err && detail == emailReady){
        _data.read('users',emailReady,function(err,userData){
          if (!err && userData){
            let userDataReady = _helpers.parseIntoJSON(userData);
            userDataReady.email = email !== false ? emailReady : userDataReady.email;
            userDataReady.firstName = firstName !== false ? firstName : userDataReady.firstName;
            userDataReady.lastName = lastName !== false ? lastName : userDataReady.lastName;
            userDataReady.phone = phone !== false ? phone : userDataReady.phone;
            userDataReady.address = address !== false ? address : userDataReady.address;
            try{
              userDataReady.password = password !== false ? passwordReady : userDataReady.passwordReady;
            }catch(e){
              //continue
            }
            _data.renameFile('users',userDataReady.email,emailReady,function(err){
              if (!err){
                _data.updateFile('users',userDataReady.email || email,userDataReady,function(err){
                  if (!err){
                    delete userDataReady.password
                    callback(200,{'userData' : userDataReady})
                  }else{
                    callback(500,{'error' : 'internal server error'});
                  }
                })
              }else{
                callback({'error': err.error})
              }
            })
          }else{
            callback(500,{'error' : 'internal server error'})
          }
        })
      }else{
        callback(422,{'error' : 'invalid data entry'})
      }
    })
  }else{
    callback(422,{'error' : 'invalid data entry'})
  }
}

//delete user data
handlers.users.delete = function(data,callback){
  let email = typeof(data.queryString.email) == 'string' && /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(data.queryString.email) ? data.queryString.email : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.length > 0 ? data.payload.password : false;
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

  if (email && password && token){
    handlers.tokens.verify(token,function(err,detail){
      _helpers.crypto(function(crypt){
        emailReady = crypt[email]
        passwordReady = crypt[password]
      },email,password)
      if (!err && detail == emailReady){
        _data.read('users',emailReady,function(err,userDataStream){
          if(!err && userDataStream){
            userDataStream = _helpers.parseIntoJSON(userDataStream)
            if (userDataStream.password == passwordReady){
                  _data.delete('users',emailReady,function(err){
                    if (!err){
                      userDataStream.tokens.forEach(function(currentRead){
                        _data.delete('tokens',currentRead,function(err){
                          //continue
                        })
                      })
                      _data.delete('validates',userDataStream.validation,function(err){
                        //continue
                      })
                      callback(200)
                    }else{
                      callback(500,{'error':'internal server error while storing data'})
                    }
                  })
            }else{
              callback(400,{'error' : 'invalid password'})
            }
          }else{
            callback(400,{'error' : 'email does not exist'})
          }
        })
      }else{
        callback(400,{'error' : 'token not exist or invalid email'})
      }
    })
}else{
    callback(422,{'error':'invalid data entry'})
}
}

//token router
handlers.tokens = function(data,callback){
  const availableMethods = ['get','post','put','delete'];
  let method = typeof(data.method) == 'string' && availableMethods.indexOf(data.method) > -1 ? data.method : false;
  if (method){
    handlers.tokens[data.method](data,function(statusCode,err){
      callback(statusCode,err)
    })
  }else{
    callback(405,{'error':'method not allowed'})
  }
}

//create token
handlers.tokens.post = function(data,callback){
  let email = typeof(data.queryString.email) == 'string' && /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(data.queryString.email) ? data.queryString.email : false;
  let password = typeof(data.headers.password) == 'string' && data.headers.password.length > 0 ? data.headers.password : false;
  if (email && password){
        _helpers.crypto(function(crypt){
          emailReady = crypt[email]
          passwordReady = crypt[password]
        },email,password)
        _data.read('users',emailReady,function(err,userData){
          userData = _helpers.parseIntoJSON(userData)
            if(!err && userData.password == passwordReady){
              let token = _helpers.randString();
              let dataJsonReady = {
                'token' : token,
                'email' : emailReady,
                'expraTime' : Date.now() + (1000 * 3600)
              }
              let dataStringReady = JSON.stringify(dataJsonReady);
              _data.createFile('tokens',token,dataStringReady,function(err){
                if (!err){
                  dataJsonReady.email = email;

                  userData.tokens !== undefined ? userData.tokens.push(token) : userData.tokens = [token]
                  _data.updateFile('users',emailReady,userData,function(err){
                    callback(200,{'success' : dataJsonReady})
                  })
                }else{
                  callback(500,{'error':'internal server error while storing data'})
                }
              })
            }else{
              callback(400,{'error' : 'invalid data entry'})
            }
        })
  }else{
    callback(422,{'error' : 'invalid email address'})
  }
}

//read the token
handlers.tokens.get = function(data,callback){
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
  _data.read('tokens',token,function(err,tokenData){
    if (!err){
      tokenData = _helpers.parseIntoJSON(tokenData)
      delete tokenData.email
      callback(200,{'tokenData' : tokenData})
    }else{
      callback(409,{'error' : 'token is not exist'})
    }
  })
}

//update token
handlers.tokens.put = function(data,callback){
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
  let emailCheck = typeof(data.payload.email) == 'string' && /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(data.payload.email) ? data.payload.email : false;

  if (token && emailCheck){
  _data.read('tokens',token,function(err,tokenRead){
    if (!err && tokenRead){
      _helpers.crypto(function(crypt){
        emailReady = crypt[emailCheck]
      },emailCheck)
      let tokenDataJson = _helpers.parseIntoJSON(tokenRead);

      if (tokenDataJson.email == emailReady){
          let dataJsonReady = {
            'token' : token,
            'email' : emailReady,
            'expraTime' : parseInt(tokenDataJson.expraTime) + 1000 * 3600
          }
          _data.updateFile('tokens',token,dataJsonReady,function(err){
            if (!err){
              callback(200,{'updatedData' : dataJsonReady})
            }else{
              callback(500,{'error' : 'internal server error while storing data'})
            }
          })
      }else{
        callback(422,{'error' : 'invalid user'})
      }
    }else{
      callback(409,{'error' : 'token does not exist'})
    }
  })
}else{
  callback(400,{'error' : 'invalid data entry'})
}
}

//delete token
handlers.tokens.delete = function(data,callback){
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
  if (token) {
    _data.read('tokens',token,function(err,tokenData){
      if (!err){
        _data.delete('tokens',token,function(err){
            if (!err){
              tokenData = _helpers.parseIntoJSON(tokenData)
              _data.read('users',tokenData.email,function(err,userData){
                userData = _helpers.parseIntoJSON(userData)
                if (userData.tokens !== undefined){
                  userData.tokens = _helpers.deleteArrItem(userData.tokens,token)

                  _data.updateFile('users',emailReady,userData,function(err,returnedData){
                    if (!err){
                      callback(200)
                    }else{
                      callback(500,{'error':'internal server error while updating user data'})
                    }
                  })
                }else{
                  callback(500,{'error' : 'internal server error while deleting the token'})
                }
              })
            }else{
              callback(500,{'error' : 'internal server error while storing data'})
            }
        })
      }else{
        callback(400,{'error':'could not read the token data'})
      }
    })
  }else{
      callback(422,{'error':'invalid data entry'})
  }
}

//token router
handlers.validation = function(data,callback){
  const availableMethods = ['get','post'];
  let method = typeof(data.method) == 'string' && availableMethods.indexOf(data.method) > -1 ? data.method : false;
  if (method){
    handlers.validation[data.method](data,function(statusCode,err){
      callback(statusCode,err)
    })
  }else{
    callback(405,{'error':'method not allowed'})
  }
}

//validation
handlers.validation.post = function(data,callback){
  let emailCheck = typeof(data.payload.email) == 'string' && /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(data.payload.email) ? data.payload.email : false;
  if (emailCheck){
    _helpers.crypto(function(crypt){
      email = crypt[emailCheck]
    },emailCheck)
    let validationKey = _helpers.randString();
    let dataJsonReady = {
      'validationKey' : validationKey,
      'email' : email,
      'expraTime' : Date.now() * 1000 * 3600 * 48,
      'state' : false
    }
    let dataStringReady = JSON.stringify(dataJsonReady);
    _data.createFile('validates',validationKey,dataStringReady,function(err){
        if(!err){
          _data.read('users',email,function(err,userData){
            userData = _helpers.parseIntoJSON(userData);
            userData.validation = validationKey
            userData = _helpers.JSONIntoString(userData);
            _data.updateFile('users',email,userData,function(err){
              if(!err){
                  if (!err){
                    let stringPayload = {
                      "from": config.fromEmail,
                      "to": emailCheck,
                      "subject": "verify your accout now ",
                      "text": `click here: http://localhost:3000/validates/?validationKey=${validationKey}`
                    }
                    stringPayload = querystring.stringify(stringPayload)
                    let auth = querystring.stringify(`api:${config.mailgunApiKey}`)
                    let path = querystring.stringify(`/v3/${config.mailgunDomain}/messages`)
                    let options = {
                      method : 'POST',
                      protocol : 'https:',
                      hostname :'api.mailgun.net',
                      auth : 'api:ee2fff5f627fbd552845cce68aeaa6d4-c8e745ec-13cf35ff',
                      path : '/v3/sandboxab8d869e4e37486a872780373ad9cab5.mailgun.org/messages',
                      headers :{
                        "cache-control" : 'no-cache',
                        "Content-Type": 'application/x-www-form-urlencoded',
                        "Content-Length": Buffer.byteLength(stringPayload)
                      }
                    }
                    _helpers.sendEmail(options,stringPayload)
                    dataJsonReady.email = email;
                    callback(200)
                  }else{
                    callback({'error':'internal server error while storing data'})
                  }
        }else{
          callback({'error':'internal server error while storing data'})
        }
      })
      })

  }else{
    callback({'error' : 'invalid email address'})
  }
})
}else{
  callback({'error' : 'invalid email address'})
}
}

//read validation key
handlers.validation.get = function(data,callback){
  let validationKey = typeof(data.queryString.validationKey) == 'string' && data.queryString.validationKey.length > 0 ? data.queryString.validationKey : false;
  if (validationKey){
  _data.read('validates',validationKey,function(err,validationKeyData){
    validationKeyData = _helpers.parseIntoJSON(validationKeyData)
    if (!err && validationKeyData && validationKeyData.state == false){
      validationKeyData.state = true
      _data.updateFile('validates',validationKey,validationKeyData,function(err){
        callback(200,validationKeyData)
      })
    }else{
      callback(409,{'error' : 'validationKey is not exist'})
    }
  })
}else{
  calback(422,{'error' : 'invalid validationKey'})
}
}

handlers.validation.put = function(data,callback){
  let validationKey = typeof(data.queryString.validationKey) == 'string' && data.queryString.validationKey.length ? data.queryString.validationKey : false;
  if (validationKey){
  _data.read('validates',validationKey,function(err,validationKeyData){
    validationKeyData = _helpers.parseIntoJSON(validationKeyData)
    if (!err && validationKeyData){
      validationKeyData.state = false
      _data.updateFile('validates',validationKey,validationKeyData,function(err){
        callback(200,validationKeyData)
      })

    }else{
      callback(409,{'error' : 'validationKey is not exist'})
    }
  })
}else{
  calback(422,{'error' : 'invalid validationKey'})
}
}

//delete token
handlers.validation.delete = function(data,callback){
  let validationKey = typeof(data.queryString.validationKey) == 'string' && data.queryString.validationKey.length > 0 ? data.queryString.validationKey : false;
  _data.delete('validates',validationKey,function(err){
    if (!err){
      callback(200)
    }else{
      callback(500,{'error' : 'internal server error while storing data'})
    }
  })
}

handlers.tokens.verify = function(tokenData,callback){
  let token = typeof(tokenData) == 'string' && tokenData.length == 20 ? tokenData : false;
  if (token){
    _data.read('tokens',token,function(err,dataStream){
      if (!err && dataStream){
        dataStream = _helpers.parseIntoJSON(dataStream)
        if (dataStream.expraTime > Date.now()){
          callback(false,dataStream.email)
        }else{
          callback(true,'internal server error')
        }
      }else{
        callback(true,'token does not exist')
      }
    })
  }else{
    callback(true,'invalid data entry')
  }
}


module.exports = handlers;
