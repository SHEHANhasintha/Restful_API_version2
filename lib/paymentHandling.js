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
  let orderOd = data[8];
  return new Promise(function(resolve,reject){
    _dataLib.read('orders',orderId,function(err,orderData){
      if (!err && orderData){
        orderData = _helpers.parseIntoJSON(orderData);
        let total = orderData.total;
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
    let cardNumber = data[3];
    let csv = data[4];
    let stripeToken = data[7];
    let payDiscryption = total;
    let tokenData = _helpers.parseIntoJSON(data[6]);
      return new Promise(function(resolve,reject){
        /*let reqData = {
          "number": '4242424242424242',
          "exp_month": 12,
          "exp_year": 2019,
          "cvc": '123'
        }*/
      /*  let reqData = {
          amount : 88,
          currency : 'usd',
          description : 'total' + payDiscryption,
          source : "tok_mastercard"
        }
        reqData = queryString.stringify(reqData)
        console.log(reqData)
        let options = {
          "method" : "POST",
          "protocol" : "https:",
          "hostname" : "api.stripe.com",
          "path" : "/v1/charges",
          "auth" : "sk_test_mCjjuZXbUeWnkNh46nWQWj33W",


          "headers" : {
            "Content-Type" : "application/x-www-form-urlencoded",
            "Content-Length" : Buffer.byteLength(reqData)

          }
        }*/



              let reqData = {
                amount : 88,
                currency : 'usd',
                description : 'total : ' + payDiscryption,
                source : "tok_mastercard"
              }
              reqData = queryString.stringify(reqData)
              console.log(reqData)
              let options = {
                method : 'POST',
                protocol : 'https:',
                hostname : 'api.stripe.com',
                path : '/v1/charges/' + 'pk_test_0p2x8s2LF3Ga5PscK0GQxu6a',
              //  Authorization : 'sk_test_mCjjuZXbUeWnkNh46nWQWj33',
              Authorization: "Bearer sk_test_mCjjuZXbUeWnkNh46nWQWj33",
                headers : {
                  "Content-Type" : 'application/x-www-form-urlencoded',
                  "Content-Length" : Buffer.byteLength(reqData)

                }
              }

              let req = https.request(options,function(res){
                console.log(res.statusCode)
                resolve([res.statusCode,tokenData,email]);
              })
              req.on('error',function(err){
                console.log(err)
              })
              req.write(reqData);
              req.end()
          })
  })

  /////////////
  .then(function(data){
    let orderData = data[9];
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
    return new Promise(function(resolve,reject){
    let reqData = {
      "from": config.fromEmail,
      "to": emailCheck,
      "subject": "verify your accout now ",
      "text": `click here: http://localhost:3000/validates/?validationKey=${validationKey}`
    }
    let options = {
      method : "POST",
      protocol : "https",
      hostname : "api.stripe.com",
      path : "/v1/payouts",
      auth : stripeToken + ':',
      headers : {
        'Content-type' : 'application/x-www-form-urlencoded',
        'Content-length' : Buffer.byteLength(reqData)
      }

    }

    })
  })

  .catch((error) => {
      console.log("ghfhf",error)
        callback(error[0],error[1])
      })

}



module.exports = payment;
