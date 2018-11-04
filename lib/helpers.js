/*
 *  Author:
 *  Date: 10:44 pm wed-oct3-18
 *  // TODO:
 *  // NOTE:
*/
const crypto = require('crypto');
const _config = require('./config');
const https = require('https');
const queryString = require('querystring');
const helpers = {}

//string into json
helpers.parseIntoJSON = function(string){
  try{
    let parsed = JSON.parse(string);
    return parsed
  }catch(err){
    return {}
  }
}

//string into json
helpers.JSONIntoString = function(string){
  try{
    let parsed = JSON.stringify(string);
    return parsed
  }catch(err){
    return {}
  }
}

//encrypt one or multiple strings
helpers.crypto = function(callback,...string){
  const crypt = {}
  string.forEach(function(currentString){
    //console.log(string)
    const hash = crypto.createHmac('sha256', _config.hashSecret)
                    .update(currentString,'utf8')
                    .digest('hex')
    crypt[currentString] = hash;
    })
    //console.log(crypt)
  callback(crypt)
}

//generate a random string given size or default = 20 charactors
helpers.randString = function(len=20){
  let string = '';
  const availableCharactors = ['1','2','3','4','5','6','7','8','9',
    'a','b','c','d','e','f','g','h','i','j','k','l',
    'm','n','o','p','q','r','s','t','u','v','w','x','y','z']
  for (let i=0; i<len; i++){
    string += availableCharactors[Math.floor(Math.random() * 35)]
  }
  return string;
}


//send email via mailgun api
helpers.sendEmail = function(options,stringPayload){
  return new Promise(function(resolve,reject){
  const req = https.request(options,function(res){
    let status = res.statusCode;
    console.log(status)
    return status
  })
  // Bind to the error event so it doesn't get thrown
req.on('error', (e)=>{
  console.log(e);
  reject('error sending email')
});

// Add the payload
req.write(stringPayload);

// End the request
req.end();
})
}


//send sms twelio // NOTE: in case we don't want some one else in other ocuntry to spam you
helpers.sendSMS = function(mobile,sendString){
  let mobileNumber = typeof(mobile) == 'number' && mobile.toString().length >= 9 ? mobile : false;
  let sendingString = typeof(sendString) == 'string' && sendingString.length > 0 ? sendString : false;
  if (mobileNumber && sendingString){
    let reqData = {
      body: sendingString,
      from: '+19738465559',
      to: mobileNumber
    }

    let options = {
      method : "POST",
      protocol : "https",
      hostname : "api.twilio.com",
      path : `/2010-04-01/Accounts${config.twilio.accoutSid}/messages.json`,
      auth : config.twilio.accoutSid+':'+config.twilio.authToken,
      headers : {
          'Content-type' : 'application/x-www-form-urlencoded',
          'Content-length' : Buffer.byteLength(stringPayload)
      }
    }

    reqData = queryString.stringify(reqData);

    let req = https.request(options,function(res){
      let status = res.statusCode;
      console.log(statusCode);
    })
    //error occurances
    req.on('error',function(err){
      console.log(err)
    })
    //write data
    req.write(reqData);
    //req end
    req.end()
  }else{
    console.log('invalid data entry : sending SMS')
  }
}

//delete one specific item from an array
helpers.deleteArrItem = function(arr,itemInStr){
  let itemIndex = arr.indexOf(itemInStr)
  let memEle = arr[arr.length - 1]
  arr[arr.length - 1] = arr[itemIndex]
  if (!(arr[itemIndex] == arr[arr.length - 1])){
    arr.push(memEle)
  }
  arr.pop()
  return arr
}

module.exports = helpers;
