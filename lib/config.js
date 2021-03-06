/*
 *  Author:
 *  Date: 1:02 pm wed-oct3-18
 *  // TODO:
 *  // NOTE:
*/

const enviroments = {};

//config the staging (defaullt) Enviroment
enviroments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'Env_Name':'staging',
  'hashSecret' : 'this is a secret',
  'mailgunApiKey' : 'ee2fff5f627fbd552845cce68aeaa6d4-c8e745ec-13cf35ff',
  'mailgunDomain' : 'sandboxab8d869e4e37486a872780373ad9cab5.mailgun.org',
  'fromEmail' : 'shehanhaintha@gmail.com',
  'stripeToken' : 'sk_test_mCjjuZXbUeWnkNh46nWQWj33',
  'twilio' : {
    'accoutSid' : 'ACdd20421a0c371e591037350ae92f7d4d',
    'authToken' : 'c9597f6ec524ba9c7ef0c990e4777949',
    'fromPhone' : '+19738465559'
  },
  'globalTemplateData' : {
    'global.appName' : 'Trojen Pizza',
    'global.baseUrl' : 'http://localhost:3000/',
    'global.yearCreated' : 2018,
    'global.companyName' : 'Trojen Pizza'
  }
}

enviroments.production = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'Env_Name':'production',
  'hashSecret' : 'this is a secret',
  'mailgunApiKey' : 'ee2fff5f627fbd552845cce68aeaa6d4-c8e745ec-13cf35ff',
  'mailgunDomain' : 'sandboxab8d869e4e37486a872780373ad9cab5.mailgun.org',
  'fromEmail' : 'shehanhaintha@gmail.com',
  'stripeToken' : 'sk_test_mCjjuZXbUeWnkNh46nWQWj33',
  'twilio' : {
    'accoutSid' : 'ACdd20421a0c371e591037350ae92f7d4d',
    'authToken' : 'c9597f6ec524ba9c7ef0c990e4777949',
    'fromPhone' : '+19738465559'
  },
  'globalTemplateData' : {
    'global.appName' : 'Trojen Pizza',
    'global.baseUrl' : 'https://localhost:3000/',
    'global.yearCreated' : 2018,
    'global.companyName' : 'Trojen Pizza'
  }
}

console.log(process.env.NODE_ENV);

//deside enviroment to run the application with
let currentEnv = typeof(process.env.NODE_ENV) !== 'staging' ? process.env.NODE_ENV.toLowerCase() : '';

//deside the enviroment is one of the above, if not export the default
let exportEnv = typeof(enviroments[currentEnv]) == 'object' ? enviroments[currentEnv] : enviroments.staging;

module.exports = exportEnv;
