/*
 * // NOTE: So this method now I am going to explain is not an actual recommended method. but this is how it works
 * Admin is a special account that can handdle whole bunch of things Basicly the whole website from ground up.
 * we need new special security rules to handle that.
 * 1. Admin's special Id's hash + system provided hash = new hash = password
 * 2.if the Admin acount is on, other aocunts shuts down and wice versa.
*/

const availableitems = {}
const admin = require('./admin')
const _dataLib = require('./data')
const _helpers = require('./helpers')
const path = require('path')
const fs = require('fs')

availableitems.available = function(data,callback){
  let availableMethods = ['post','get','put','delete'];
  if (availableMethods.indexOf(data.method) > -1 && typeof(data.method) == 'string'){
    availableitems[data.method](data,async function(retData,err){
      await callback(retData,err)
    })
  }else{
    callback(422,{'error' : 'unavilble method'})
  }
}

availableitems.gui = {}

availableitems.gui.available = function(data,callback){
  //avoid unnessary methods
  if (data.method == "get"){
    _helpers.getTemplate('availableItems',function(err,templateData){
      if (!err && templateData){
        let renderInfo = {
          "{head.title}" : "available Items"
        }
        _helpers.universalRender(templateData,renderInfo,function(err,uniData){
          if (!err && uniData){
            callback(200,uniData,"html")
          }else{
            callback(500,"data rendering error","plain")
          }
        })
      }else{
        callback(500,"template does not exist",'plain')
      }
    })
  }else{
    callback(422,"invelid method",'plain')
  }
}

//create
availableitems.post = function(data,callback){
  admin.adminAuth();
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
  // name of product
  let product = typeof(data.payload.product) == 'string' ? data.payload.product : false;
  // price of the product
  let price = typeof(data.payload.price) == 'number' ? data.payload.price : false;
  // expra period of time
  let expraTime = typeof(data.payload.expraTime) == 'number' ? data.payload.expraTime : false;
  // product id
  let productId = typeof(data.payload.productId) == 'string' ? data.payload.productId : false;
  // discription
  let discription = typeof(data.payload.discription) == 'string' ? data.payload.discription : false;
  console.log(token,product,price,expraTime,productId,discription,data)
  return new Promise(function(resolve,reject){
    if (token && product && price && expraTime && productId && discription){
      resolve([token,product,price,expraTime,productId,discription])
    }else{
      callback(400,{'error' : 'invalid data entry'})
    }
  })
  .then(
    function(data){
      let product = data[1]
      let price = data[2]
      let expraTime = data[3]
      let productId = data[4]
      let discription = data[5]

      return new Promise(function(resolve,reject){
        _dataLib.read('tokens',token,function(err,tokenData){
          if (!err){
            let dataReady = {
              'product' : product,
              'price' : price,
              'expraTime' : expraTime,
              'productId' : productId,
              'discription' : discription
            }
            resolve(dataReady)
          }else{
            callback(400,{'error': 'you are not logged in'})
          }
        })
      })
    }
  )
  .then(
    function(data){
      return new Promise(function(resolve,reject){
        _dataLib.read('availableItems',data.productId,function(err,productionData){
          if (err){
            resolve(data)
          }else{
            resolve(callback(400,{'error' : 'production already exist'}))
          }
        })
      })
    }
  )
  .then(
    function(data){
      return new Promise(function(resolve,reject){
        let productionId = data.productId;
        let product = _helpers.JSONIntoString(data)
        _dataLib.createFile('availableItems',productionId,product,function(err){
          if (!err){
            resolve(callback(200,false))
          }else{
            resolve(callback('failed to store data'))
          }
        })
      })
    })
}



availableitems.all = {};

availableitems.all.get = function(data,callback){
  console.log('graaaaaaaaaaaaaaad',data.headers.token)
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
  console.log(token,'sdssssdsdsdsds')
  if (token){
    return new Promise(function(resolve,reject){
      _dataLib.read('tokens',token,function(err,tokenData){
        if (!err && tokenData){
          resolve()
        }else{
          reject(callback(400,{'error' : 'you are not logged in'},"JSON"))
        }
      })
    })
    .then(function(){
      return new Promise(async function(resolve,reject){
        let defaultPath = path.join(__dirname,'/../.data/availableitems/')
        await fs.readdir(defaultPath,function(err,files){
          if (!err && files){
            resolve(callback(200,files,'JSON'));
          }else{
            reject(callback(500,{'error' : 'failed to read files'},"JSON"))
          }
        })
      })
    })
  }else{
    callback(400,{'error' : 'invalid data entry'},"JSON")
  }
}

//get
availableitems.get = function(data,callback){
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
  let reqItem = typeof(data.queryString.item) == 'string' && data.queryString.item.length > 0 ? data.queryString.item : false;
  console.log(reqItem,'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
  if (token && reqItem){
    return new Promise(function(resolve,reject){
      _dataLib.read('tokens',token,function(err,tokenData){
        if (!err && tokenData){
          resolve(reqItem)
        }else{
          resolve(callback(400,{'error' : 'you are not logged in'},'JSON'))
        }
      })
    })
    .then(function(reqItem){
      return new Promise(function(resolve,reject){
        reqItem = reqItem.replace('.json','')
        _dataLib.read('availableItems',reqItem,function(err,itemData){
          if (!err){
            itemData = _helpers.parseIntoJSON(itemData)
            resolve(callback(200,itemData,'JSON'))
          }else{
            reject(callback(500,{'error' : 'unalble to read the file'},'JSON'))
          }
        })
      })
    })
    .catch((error) => {
    console.log("error",error)
      callback(error[0],error[1])
    })
  }else{
    callback(400,{'error' : 'invalid data entry'},'JSON')
  }
}

//update
availableitems.put = function(data,callback){
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
  let product = typeof(data.payload.product) == 'string' && data.payload.product !== undefined ? data.payload.product : false;
  let price = typeof(data.payload.price) == 'number' && data.payload.price !== undefined ? data.payload.price : false;
  let expraTime = typeof(data.payload.expraTime) == 'number' && data.payload.expraTime !== undefined ? data.payload.expraTime : false;
  let productId = typeof(data.payload.productId) == 'string' ? data.payload.productId : false;
  let discription = typeof(data.payload.discription) == 'string' && data.payload.discription !== undefined ? data.payload.discription : false;
  return new Promise(function(resolver,reject){
    if (token && productId && (product || price || expraTime || discription)){

    _dataLib.read('tokens',token,function(err,tokenData){
      if (!err && tokenData){
        resolver([product,price,expraTime,productId,discription])
      }else{
        resolver(callback(422,{'error' : 'invalid Data entry'}))
      }
    })

  }else{
    resolver(callback(422,{'error' : 'invalid Data entry'}))
  }
  })
    .then(
      function(arr){
        let product = arr[0]
        let price = arr[1]
        let expraTime = arr[2]
        let productId = arr[3]
        let discription = arr[4]
        return new Promise(function(resolver,reject){
          _dataLib.read('availableItems',productId,function(err,readItems){
            if (!err && readItems){
              resolver([product,price,expraTime,productId,discription,readItems])
            }else{
              resolver(callback(400,{'error' : 'item is not exist'}))
            }
          })
        })
        .then(function(arr){
          let product = arr[0]
          let price = arr[1]
          let expraTime = arr[2]
          let productId = arr[3]
          let discription = arr[4]
          let readItem = arr[5]
          readItem = _helpers.parseIntoJSON(readItem)

          if (product){
            readItem.product = product
          }
          if (price){
            readItem.price = price
          }
          if (expraTime){
            readItem.expraTime = expraTime
          }
          if (productId){
            readItem.productId = productId
          }
          if (discription){
            readItem.discription = discription
          }
          return new Promise(function(resolve,reject){
            _dataLib.updateFile('availableItems',productId,readItem,function(err){
              if (!err){
                resolve(callback(200,readItem))
              }else{
                resolve(callback(500,{'error' : 'server failure'}))
              }
            })
          })
        })
      }
    )


}
//delete
availableitems.delete = function(data,callback){
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
  let item = typeof(data.queryString.item) == 'string' && data.queryString.item.length > 0 ? data.queryString.item : false;

    return new Promise(function(resolve,reject){
  if (item && token) {
    _dataLib.read('tokens',token,function(err,tokenData){
      if (!err){
        resolve([tokenData,item])
      }else{
        resolve(callback(400,{'error' : 'file not exist'}))
      }
    })

  }else{
    resolve(callback(422,{'error' : 'invalid data entry'}))
  }
  })
  .then(function(arr){
    let id = arr[1];
    let tokenData = arr[0];
    return new Promise(function(resolve,reject){
    _dataLib.read('availableItems',id,function(err,itemData){
      if (!err){
        resolve(id)
      }else{
        resolve(callback(400,{'error' : 'file not exist'}))
      }
    })
    })
    .then(function(id){
      return new Promise(function(resolve,reject){
        _dataLib.delete('availableItems',id,function(err){
          if (!err){
            resolve(callback(200))
          }else{
            resolve(callback(400,{'error' : 'file not exist'}))
          }
        })
      })
    })
  })

}

module.exports=availableitems
