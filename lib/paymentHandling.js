/*
 *
 *
 *
*/

const config = require('./config')
const _helpers = require('./helpers')
const _dataLib = require('./data')
const handlers = require('./handlers')
const https = require('https')
const queryString = require('querystring');

const payment = {}

payment.pay = async function(data,callback){
  const availableMethods = ['post']
  let method = typeof(data.method) == 'string' && availableMethods.indexOf(data.method) > -1 ? data.method : false;
  if (method){
    await payment.pay[data.method](data,function(statusCode,err){
      callback(statusCode,err)
    })
  }else{
    callback(405,{'error':'method not allowed'})
  }
}

payment.pay.post = function(data,callback){
  let token = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false
  let orderId = typeof(data.payload.orderId) == 'string' && data.payload.orderId.length > 0 ? data.payload.orderId : false;
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.length > 0 ? data.payload.firstName : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.length > 0 ? data.payload.lastName : false;
  let email = typeof(data.payload.email) == 'string' && /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(data.payload.email) ? data.payload.email : false;
  let cardNumber = typeof(data.payload.cardNumber) == 'number' ? data.payload.cardNumber : false;
  let csv = typeof(data.payload.csv) == 'number' ? data.payload.csv : false;
  let stripeToken = config.stripeToken;

////////////////
  return new Promise(function(resolve,reject){
    if (token && firstName && lastName && cardNumber && csv && orderId){
      _dataLib.read('tokens',token,function(err,tokenData){
        if (!err && tokenData){
          resolve([token,firstName,lastName,cardNumber,csv,email,tokenData,stripeToken,orderId])
        }else{
          reject([400,{'error' : 'invalid token'}])
        }
      })
    }else{
      reject([422,{'error' : 'invalid data entry'}])
    }
  })

///////////////
  .then(function(data){
    let orderId = data[8]
    let email = data[0].email
    return new Promise(function(resolve,reject){
      let inEmail;
      _helpers.crypto(function(mail){
        inEmail = mail[data[5]]
      },data[5])
        _dataLib.read('users',inEmail,function(err,userData){
          if (!err && userData){
            if (inEmail == _helpers.parseIntoJSON(data[6]).email){
              userData = _helpers.parseIntoJSON(userData);
              if (userData.orderId.indexOf(orderId) > -1){
                data.push(inEmail)
                resolve(data)
              }else{
                reject([400,{'error' : 'order not exist'}])
              }
            }else{
              reject([400,{'error':'wrong email'}])
            }
          }else{
            reject([400,{'error':'wrong email'}])
          }
        })
    })
  })

/////////
.then(function(data){
  let orderId = data[8];

  return new Promise(async function(resolve,reject){
    await _dataLib.read('orders',orderId,function(err,orderData){
      if (!err && orderData){
        orderData = _helpers.parseIntoJSON(orderData);
        let total = orderData.total;
        //console.log(orderData)
        data.push(orderData)
        data.push(total)

        resolve(data);
      }else{
        reject([400,{'error' : 'order not exist'}])
      }
    })
  })
})

//////////
  .then(function(data){
    let total = data[10].total;
    //console.log(data)
    let cardNumber = data[3];
    let csv = data[4];
    let stripeToken = data[7];
    let payDiscryption = total;
    let tokenData = _helpers.parseIntoJSON(data[6]);
      return new Promise(function(resolve,reject){
              var reqData = {
                amount : 88,
                currency : 'usd',
                description : 'total:' + payDiscryption,
                source : "tok_mastercard"
              }
              reqData = queryString.stringify(reqData)
              //console.log(reqData)
              //reqData = 'amount=88&currency=usd&description=hgjjhjg&source=tok_mastercard'
              //console.log(reqData)
              let options = {
                method : 'POST',
                protocol : 'https:',
                hostname : 'api.stripe.com',
                path : '/v1/charges',
                headers : {
                  "Content-Type" : 'application/x-www-form-urlencoded',
                  "Content-Length" : Buffer.byteLength(reqData),
                  "Authorization" : 'Bearer sk_test_mCjjuZXbUeWnkNh46nWQWj33'
                }
              }

              let req = https.request(options,function(res){
                if (res.statusCode == 200 || res.statusCode == 201){
                  resolve(data);
                }else {
                  reject([400,{'error' : 'payment fail'}])
                }
              })

              req.on('error',function(err){
                console.log(err,'rrr')
              })
              req.write(reqData);
              req.end()
          })
  })

  /////////////
  .then(function(data){
    let orderData = data[10];
    let orderId = data[8];

    orderData.state = 'sold';
    return new Promise(function(resolve,reject){
      _dataLib.updateFile('orders',orderId,orderData,function(err){
        if (!err){
          resolve(data)
        }else{
          reject([400,{'error':'updating orders failed'}])
        }
      })
    })
  })

  ////////////////////
  .then(function(data){
    let emailCheck = data[5]
    return new Promise(function(resolve,reject){
    let reqData = {
      "from": config.fromEmail,
      "to": emailCheck,
      "subject": "payment details",
      "text": 'ertty'
    }
    reqData = queryString.stringify(reqData)
    let options = {
      method : 'POST',
      protocol : 'https:',
      hostname :'api.mailgun.net',
      auth : 'api:ee2fff5f627fbd552845cce68aeaa6d4-c8e745ec-13cf35ff',
      path : '/v3/sandboxab8d869e4e37486a872780373ad9cab5.mailgun.org/messages',
      headers :{
        "cache-control" : 'no-cache',
        "Content-Type": 'application/x-www-form-urlencoded',
        "Content-Length": Buffer.byteLength(reqData)
      }
    }
    _helpers.sendEmail(options,reqData)
    resolve(data)
    })
  })

  .catch((error) => {
      console.log("ghfhf",error)
        callback(error[0],error[1])
      })

}



module.exports = payment;
