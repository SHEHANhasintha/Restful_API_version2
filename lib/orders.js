/*
 *  Author: Shehan Hasintha [Explorer]
 *  Date: 2018- nov
 * Technology stack => JavaScript[ES5,ES6,ES7,ES8]
 *  Tested: manualy tested all ==by== @POSTMAN

 !------------------__parameters__And__DataFormats___------------------------!
   1  firstName =>  only string [ex: Feilix]
   2  lastName  =>  only string [ex: Kjellberg]
   3  email     =>  only string [ex: test1@test.com]
   4  phone     =>  more than 9 digit number including countrycode and no zero begin [ex: 15748725798]
   5  address   =>  "xx:##,xxxxxxxxx,xxxxxxxxx,xxxxxx" [ex: no:56, Copenhagen, Denmark]
   6  password  =>  "xxxxxxxxx" [ex: 67test!As@4Hell]
   7  token     => "xxxxxxxxxxxxxxxxxxxx" [ex: nqsr52oh9hk2n4dvus7t]
################################################################################

   |~ @orders__
    |~  @item__[Promise]
            #function#         #parameters#
        |- POST [tested]    (data.headers[token,item],data.payload[quantity] => Object,callback[itemId,quantity,tokenData] => Array)
        |- GET [tested]     (data.headers[token] => Object,callback[200,{'orders' : outputReady}] => statusCode,Object)
        |- PUT [tested]     (data.headers[token],data.queryString[orderId],callback[200,false] => statusCode,boolean)
        |- DELETE [tested]  (data.headers[token],data.payload[orderId],data.payload[quantity],callback[200,orderData] => statusCode,Object)
  |~ @orders__
    |~  @item__
        |- POST [tested]    (data[],callback)
        |- GET [tested]     (data[],callback)
        |- PUT [tested]     (data[],callback)
        |- DELETE [tested]  (data[],callback)

  |~ @data__
     |- readDir      ()
     |- read         ()
     |- createFile   ()
     |- updateFile   ()
     |- delete       ()
     |- renameFile   ()

* What is exactly orders module does?
    orders module bascly handles all the orders you can make and also manage them as a shopping cart. customers can make a request to ask for an order to be parchused.
    when a customer makes an order it store as in the shoppingcart. GUI for that application is going to make another rapede request to buy that choosen item.

* Reason to add promises : the fs module will make it work when a function calls to 'fs' module to createFile,writeFile,updateFile or read the File.
 But it takes some time finish. The time it takes to finish that certain job is prohibitively expensive. Then the function what called by has to wait
  until that job is done. So promises will do the job.

* The functionality runs under CRUD operations.
  Create  : POST
  Read    : GET
  Update  : PUT
  Delete  : DELETE

* what functions do we got?
    ** All the crud operations compacted into an one Object called orders [orders = {}]
    * The orders Object has only one sub object called item [orders.item]
    * The item Object has its own CRUD orerations (data is a typeof Object, callback is a function you can replace)
          [orders.item.POST]    => create the post  =>  function(data,callback)
          [orders.item.GET]     => read the post    =>  function(data,callback)
          [orders.item.PUT]     => Update the post  =>  function(data,callback)
          [orders.item.DELETE]  => Delete the post  =>  function(data,callback)

  !------------------__parameters__And__DataFormats___------------------------!
    1  firstName =>  only string [ex: Feilix]
    2  lastName  =>  only string [ex: Kjellberg]
    3  email     =>  only string [ex: test1@test.com]
    4  phone     =>  more than 9 digit number including countrycode and no zero begin [ex: 15748725798]
    5  address   =>  "xx:##,xxxxxxxxx,xxxxxxxxx,xxxxxx" [ex: no:56, Copenhagen, Denmark]
    6  password  =>  "xxxxxxxxx" [ex: 67test!As@4Hell]
    7  token     => "xxxxxxxxxxxxxxxxxxxx" [ex: nqsr52oh9hk2n4dvus7t]
################################################################################
    @orders__
      @item__
******* POST request [create the post] => data =>
        -payload-     {
                        "item":"xxxxxxx",
                        "quantity":"xxxxxx"
                      }
        -Headers-     {token:"xxxxxxxxxxxxxxxxxxxx"}

****** GET request [get the user data] => data =>
        -Headers-     {token:"xxxxxxxxxxxxxxxxxxxx"}

    @orders__
      @item__
****** PUT request [Update the item] => data =>
        -payload-     {"quantity":"xxxxxxx",
                        "orderId":"xxxxxx"}
        -headers-     {token : "xxxxxxxxxxxxxxxxxxx";}

****** DELETE request [Delete the Delete] => data =>
        -queryString- {"orderId":"xxxxxxxxxxxxxxxxx"}
        -headers-     {"token":"xxxxxxxxxxxxxxxxxxxx"}

      @orders__
        @item__
****** callback(statusCode,err)

!-----------------------___RETURN___DATA__AND__STATUScODES---------------------!
################################################################################
    @orders__
      @item__
******* POST request [create the post] => callback =>
          200,{'success' : itemData}
****** GET request [get the user data] => callback =>
          200,{'orders' : outputReady}
****** PUT request [Update the Update] => callback =>
          200,orderData
****** DELETE request [Delete the Delete] => callback =>
          200,false

!--------------error Codes and statusCodes-----------!
################################################################################
    @orders__
      @item__
        405,{'error':'method not allowed'}
    @orders__
      @item__
******* POST request [create the post],[promise] => callback =>
          1. 422,{'error' : 'invalid token'}
          2. 422,{'error' : 'invalid data entry'}
          3. 400,{'error' : 'item not exist'}
          4. 400,{'error' : 'failed to create file'}
          5. 400,{'error' : 'error while updating file'}
          6. 422,{'error' : 'unauthorized access'}

****** GET request [get the user data] => callback =>
          1. 400,{'error' : 'could not read token data'}
          2. 422,{'error' : 'invalid data entry'}
          3. 400,{'error' : 'user not exist'}
****** PUT request [Update the Update] => callback =>
          1. 422,{'error' : 'invalid data entry'}
          2. 400,{'error' : 'failed to verify'}
          3. 400,{'error' : 'order not exist'}
          4. 400,{'error' : 'order not exist'}
****** DELETE request [Delete the Delete] => callback =>
          1. 400,{'error' : 'order not exist'}
          2. 400,{'error' : 'you are not logged in'}
          3. 400,{'error' : 'invalid data entry'}
          4. 400,{'error' : 'applicable user not exist'}
          5. 400,{'error' : 'order not exist'}
          6. 400,{'error' : 'user does not exist'}

*  DATAFLOW:::::::::::
|~ @orders__
 |~  @item__
     |- POST
     |- GET
     |- PUT
     |- DELETE
|~ @orders__
 |~  @item__
     |- POST
     |- GET
     |- PUT
     |- DELETE


*/

const orders = {}
const _dataLib = require('./data');
const _helpers = require('./helpers')
const handlers = require('./handlers')
const _logs = require('./logs')

orders.gui = {}

orders.gui.dashboard = function(data,callback){
  _helpers.getTemplate('dashboard',function(err,dashData){
    if (!err && dashData){
      let renderInfo = {
        'head.title' : 'Dashboard',
        'body.table' : 'summery'
      }
      _helpers.universalRender(dashData,renderInfo,function(err,uniData){
        if (!err && uniData){
          callback(false,uniData,'html')
        }else{
          callback(500,"could not render the page",'plain')
        }
      })
    }else{
      callback(500,"could not find the page",'plain')
    }
  })
}

orders.gui.discription = function(data,callback){
  _helpers.getTemplate('discription',function(err,dashData){
    if (!err && dashData){
      let renderInfo = {
        'head.title' : 'discription'
      }
      _helpers.universalRender(dashData,renderInfo,function(err,uniData){
        if (!err && uniData){
          callback(false,uniData,'html')
        }else{
          callback(500,"could not render the page",'plain')
        }
      })
    }else{
      callback(500,"could not find the page",'plain')
    }
  })
}


orders.gui.edit = function(data,callback){
  _helpers.getTemplate('editverify',function(err,dashData){
    if (!err && dashData){
      let renderInfo = {
        'head.title' : 'editverify',
        'editOrder.title' : "Edit and verify order"
        }
      _helpers.universalRender(dashData,renderInfo,function(err,uniData){
        if (!err && uniData){
          callback(false,uniData,'html')
        }else{
          callback(500,"could not render the page",'plain')
        }
      })
    }else{
      callback(500,"could not find the page",'plain')
    }
  })
}

orders.item = async function(data,callback){
  const availableMethods = ['post','get','put','delete'];
  let method = typeof(data.method) == 'string' && availableMethods.indexOf(data.method) > -1 ? data.method : false;
  if (method){
    await orders.item[data.method](data,function(statusCode,err,type){
      callback(statusCode,err,type)
    })
  }else{
    callback(405,{'error':'method not allowed'},"JSON")
  }
}

orders.item.post = function(data,callback){
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
  let itemId = typeof(data.payload.item) == 'string' && data.payload.item.length > 0 ? data.payload.item : false;
  let quantity = typeof(parseInt(data.payload.quantity)) == 'number' && parseInt(data.payload.quantity) > 0 ? parseInt(data.payload.quantity) : false;
  return new Promise(function(resolve,reject){
    if (token && itemId && quantity){
      _dataLib.read('tokens',token,function(err,tokenData){
        if (!err){

          resolve([itemId,quantity,data,tokenData])
        }else{
          reject([422,{'error' : 'invalid token'},"JSON"])
        }
      })
    }else{
      reject([422,{'error' : 'invalid data entry'},"JSON"])
    }
  })


   .then(function(data){

      let item = data[0];
      //let trans = data;
      return new Promise(function(resolve,reject){
        _dataLib.read('availableItems',item,function(err,itemData){
          if (!err){
            itemData = _helpers.parseIntoJSON(itemData)
            data.itemData = itemData
            resolve(data)
          }else{
            reject([400,{'error' : 'failed to read file'},"JSON"])
          }
        })
      })
    })

   .then(function(data){
      let itemId = data[0]
      let quantity = data[1]
      let itemData = data.itemData;
      let tokenData = data[3]
      tokenData = _helpers.parseIntoJSON(tokenData)
      let orderId = _helpers.randString(40)
      itemData['orderId'] = orderId;
      itemData['quantity'] = quantity;
      itemData['email'] = tokenData.email
      itemData['total'] = itemData.price * quantity;
      itemData['state'] = 'In Cart'
      //delete itemData.price
      itemData = _helpers.JSONIntoString(itemData)
      return new Promise(function(resolve,reject){
        _dataLib.createFile('orders',orderId,itemData,function(err){
          if (!err){
            itemData = _helpers.parseIntoJSON(itemData)
            resolve([orderId,tokenData,itemData])
          }else{
            reject([400,{'error' : 'failed to create file'},"JSON"])
          }
        })
      })
    }).then(function(data){
      let itemId = data[0]
      let tokenData = data[1]
      let itemData = data[2]
      let email = tokenData.email
      _dataLib.read('users',email,function(err,userData){
        return new Promise(function(resolve,reject){
          if (!err){
            userData = _helpers.parseIntoJSON(userData)
            userData.orderId !== undefined ? userData.orderId.push(itemId) : userData.orderId = [itemId]
            _dataLib.updateFile('users',email,userData,function(err){
              if (!err){
                _logs.logFiles('orders',itemId,function(err){
                  //continue
                  console.log(err)
                })
                delete itemData.email
                resolve(callback(200,{'success' : itemData},"JSON"))
              }else{
                reject([400,{'error' : 'error while updating file'},"JSON"])
              }
            })
          }else{
            reject([422,{'error' : 'unauthorized access'},"JSON"])
          }
         })

      })
    }).catch(e => {
    callback(e[0],e[1],e[2])
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
          reject(callback(400,{'error' : 'could not read token data'},'JSON'))
        }
      })
      }else{
        reject(callback(422,{'error' : 'invalid data entry'},'JSON'))
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
            reject(callback(400,{'error' : 'user not exist'},'JSON'))
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
        resolve(callback(200,{'orders' : outputReady},'JSON'))
      })
    })

    .catch(err => {
    })
}

orders.item.put = function(data,callback){
  let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  let quantity = typeof(parseInt(data.payload.quantity)) == 'number' ? parseInt(data.payload.quantity) : false;
  let orderId = typeof(data.payload.orderId) == 'string' ? data.payload.orderId : false;
  let productId = typeof(data.payload.productId) == 'string' ? data.payload.productId : false;
  return new Promise(function(resolve,reject){
    if (token && quantity){
        handlers.tokens.verify(token,function(err,tokenData){
          if (!err){
            resolve([quantity,orderId,productId])
          }else{
            reject([400,{'error' : 'failed to verify'},"JSON"])
          }
        })
    }else{
      reject([422,{'error' : 'invalid data entry'},"JSON"])
    }
  })
  .then(function(data){
    let quantity = data[0]
    let orderId = data[1]
    let productId = data[2]
    return new Promise(function(resolve,reject){
      _dataLib.read('orders',orderId,function(err,orderData){
        if (!err){
          resolve([quantity,orderId,orderData,productId])
        }else{
          reject([400,{'error' : 'order not exist'},"JSON"])
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
            resolve([quantity,data[3],orderData])
          }else{
            reject([400,{'error' : 'order not exist'},"JSON"])
          }
        })
    })
  })
    .then(function(data){
    let productId = data[1]
    let quantity = data[0]
    let orderData = data[2]
    return new Promise(function(resolve,reject){
      _dataLib.read('availableItems',productId,function(err,productData){
        if (!err){
          resolve([quantity,productId,productData,orderData])
        }else{
          reject([400,{'error' : 'productData not exist'},"JSON"])
        }
      })
    })
  })
  .then(function(data){
    let productId = data[1]
    let quantity = data[0]
    let orderData = data[3]
    let productData = _helpers.parseIntoJSON(data[2])
    orderData.total = productData.price * quantity;
    return new Promise(function(resolve,reject){
        _dataLib.updateFile('orders',orderId,orderData,function(err){
          if (!err){
            resolve(callback(200,orderData,"JSON"))
          }else{
            reject([400,{'error' : 'order not exist'},"JSON"])
          }
        })
    })
  })
  .catch(e => {
    callback(e[0],e[1],e[2]);

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
