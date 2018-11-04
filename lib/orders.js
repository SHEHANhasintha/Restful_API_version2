/*
 *  Author:
 *  Date:
 *  // NOTE:
*/

const orders = {}
const _dataLib = require('./data');
const _helpers = require('./helpers')
const handlers = require('./handlers')

orders.item = async function(data,callback){
  const availableMethods = ['post','get','put','delete'];
  let method = typeof(data.method) == 'string' && availableMethods.indexOf(data.method) > -1 ? data.method : false;
  if (method){
    await orders.item[data.method](data,function(statusCode,err){
      callback(statusCode,err)
    })
  }else{
    callback(405,{'error':'method not allowed'})
  }
}

orders.item.post = function(data,callback){
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
  let itemId = typeof(data.payload.item) == 'string' && data.payload.item.length > 0 ? data.payload.item : false;
  let quantity = typeof(data.payload.quantity) == 'number' && data.payload.quantity > 0 ? data.payload.quantity : false;
  return new Promise(function(resolve,reject){
    if (token && itemId && quantity){
      _dataLib.read('tokens',token,function(err,tokenData){
        if (!err){
          resolve([itemId,quantity,tokenData])
        }else{
          reject(callback(422,{'error' : 'invalid token'}))
        }
      })
    }else{
      reject(callback(422,{'error' : 'invalid data entry'}))
    }
  })
  .then(function(data){
    let itemId = data[0]
    let quantity = data[1]
    let tokenData = data[2]

    return new Promise(function(resolve,reject){
    _dataLib.read('availableItems',itemId,function(err,itemData){
        if (!err){
          resolve([itemId,quantity,itemData,tokenData])
        }else{
          resolve(400,{'error' : 'item not exist'})
        }
      })
    })
    .then(function(data){
      let itemId = data[0]
      let quantity = data[1]
      let itemData = data[2]
      let tokenData = data[3]
      tokenData = _helpers.parseIntoJSON(tokenData)
      itemData = _helpers.parseIntoJSON(itemData)
      let orderId = _helpers.randString(40)
      itemData['orderId'] = orderId;
      itemData['quantity'] = quantity;
      itemData['email'] = tokenData.email
      itemData['total'] = itemData.price * quantity;
      itemData['state'] = 'In Cart'
      delete itemData.price
      itemData = _helpers.JSONIntoString(itemData)
      return new Promise(function(resolve,reject){
        _dataLib.createFile('orders',orderId,itemData,function(err){
          if (!err){
            itemData = _helpers.parseIntoJSON(itemData)
            resolve([orderId,tokenData,itemData])
          }else{
            reject(callback(400,{'error' : 'failed to create file'}))
          }
        })
      })
    }).then(function(data){
      let itemId = data[0]
      let tokenData = data[1]
      let itemData = data[2]
      let email = tokenData.email
      _dataLib.read('users',email,function(err,userData){
        if (!err){
          userData = _helpers.parseIntoJSON(userData)
          userData.orderId !== undefined ? userData.orderId.push(itemId) : userData.orderId = [itemId]
          _dataLib.updateFile('users',email,userData,function(err){
            if (!err){
              delete itemData.email
              callback(200,{'success' : itemData})
            }else{
              reject(400,{'error' : 'error while updating file'})
            }
          })
        }else{
          reject(422,{'error' : 'unauthorized access'})
        }
      })
    })
  })
}

orders.item.get = function(data,callback){
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
    let outputReady = [];
    return new Promise(function(resolve,reject){
      if (token){
      _dataLib.read('tokens',token,function(err,tokenData){
        if (!err && tokenData){
          tokenData = _helpers.parseIntoJSON(tokenData);
          resolve([tokenData,outputReady])
        }else{
          resolve(callback(400,{'error' : 'could not read token data'}))
        }
      })
      }else{
        resolve(callback(422,{'error' : 'invalid data entry'}))
      }
    })
    .then(function(arr){
      let tokenData = arr[0]
      let email = tokenData.email;
      let outputReady = arr[1]
      return new Promise(function(resolve,reject){
        _dataLib.read('users',email,function(err,userData){
          if (!err){
            resolve([userData,outputReady,email])
          }else{
            resolve(callback(400,{'error' : 'user not exist'}))
          }
        })
      })
    })
    .then(function(arr){
      let userData = arr[0]
      userData = _helpers.parseIntoJSON(userData)
      let orderId = userData.orderId !== undefined ? userData.orderId : false
      let outputReady = arr[1]
      let email = arr[2]
      return new Promise(async function(resolve,reject){
        for (let i=0; i<orderId.length; i++){
          await _dataLib.read('orders',orderId[i],function(err,orderData){
            if (!err && orderData){
                orderData = _helpers.parseIntoJSON(orderData)
                outputReady.push(orderData)
            }
          })
        }
        resolve(callback(200,{'orders' : outputReady}))
      })
    })
}

orders.item.put = function(data,callback){
  let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  let quantity = typeof(data.payload.quantity) == 'number' ? data.payload.quantity : false;
  let orderId = typeof(data.payload.orderId) == 'string' ? data.payload.orderId : false;
  return new Promise(function(resolve,reject){
    if (token && quantity){
        handlers.tokens.verify(token,function(err,tokenData){
          if (!err){
            resolve([quantity,orderId])
          }else{
            reject(callback(400,{'error' : 'failed to verify'}))
          }
        })
    }else{
      reject(callback(422,{'error' : 'invalid data entry'}))
    }
  })
  .then(function(data){
    let quantity = data[0]
    let orderId = data[1]

    return new Promise(function(resolve,reject){
      _dataLib.read('orders',orderId,function(err,orderData){
        if (!err){
          resolve([quantity,orderId,orderData])
        }else{
          reject(callback(400,{'error' : 'order not exist'}))
        }
      })
    })
  })
  .then(function(data){
    let quantity = data[0]
    let orderId = data[1]
    let orderData = _helpers.parseIntoJSON(data[2])
    orderData.quantity = quantity;
    return new Promise(function(resolve,reject){
        _dataLib.updateFile('orders',orderId,orderData,function(err){
          if (!err){
            resolve(callback(200,orderData))
          }else{
            reject(callback(400,{'error' : 'order not exist'}))
          }
        })
    })
  })
}

orders.item.delete = function(data,callback){
  let orderId = typeof(data.queryString.orderId) == 'string' && data.queryString.orderId.length > 0 ? data.queryString.orderId : false;
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
  return new Promise(async function(resolve,reject){

    if (orderId && token){
      await handlers.tokens.verify(token,async function(err){
        if (!err){
          await _dataLib.read('orders',orderId,function(err,orderData){
            if (!err){
              resolve([orderId,orderData])
            }else{
              reject(callback(400,{'error' : 'order not exist'}))
            }
          })
        }else{
          reject(callback(400,{'error' : 'you are not logged in'}))
        }
      })
    }else{
      reject(callback(400,{'error' : 'invalid data entry'}))
    }
  })

  .then(function(data){
    let orderId = data[0]
    let orderEmail = _helpers.parseIntoJSON(data[1]).email;
    return new Promise(function(resolve,reject){
        _dataLib.read('users',orderEmail,function(err,userData){
          if (!err && userData){
            userData = _helpers.parseIntoJSON(userData)
            userData.orders = _helpers.deleteArrItem(userData.orderId,orderId)
            resolve([orderId,orderEmail,userData])
          }else{
            resolve(callback(400,{'error' : 'applicable user not exist'}))
          }
        })

    })
  })
  .then(function(data){
    let orderId = data[0]
    let orderEmail = data[1]
    let userData = data[2]
    return new Promise(function(resolve,reject){
    _dataLib.delete('orders',orderId,function(err){
      if (!err){
        resolve([orderId,orderEmail,userData])
      }else{
        reject(callback(400,{'error' : 'order not exist'}))
      }
    })
  })
})
  .then(function(data){
    let orderId = data[0]
    let orderEmail = data[1]
    let userData = data[2]
    return new Promise(function(resolve,reject){
    _dataLib.updateFile('users',orderEmail,userData,function(err){
        if (!err){
          resolve(callback(200,false))
        }else{
          reject(callback(400,{'error' : 'user does not exist'}))
        }
      })
    })
  })
}

module.exports = orders;
