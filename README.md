#getting stated
*This is a backend project that has RESTFUL API developed for a PIZZA DELIVERY company.
This repository has been developed and still to be developed as the home work assignment in NodeJs master class.
#start the server
run : exe.bat
This backend could be running on two enviroments
*staging
		http://localhost:3000
*production
		http://localhost:3001
Basic ping for the first test to see weather the RESTFUL API is working or not working.
*/ping
		http://localhost:3000/ping

This RESTFUL API includes these microservices and they have their own CRUD OPERATIONS available.

//backend
  'api/users' : handlers.users,
  'api/tokens' : handlers.tokens,
  'validates/validates' : handlers.validation,
  'api/logout' : logout.users,
  'items/availableItems' : availableItems.gui.available,
  'orders/orders' : orders.item,
  'buy/purchase' : purchase.pay,
  'api/buyNow' : purchase.pay,  

//frontend
  'account/create' : handlers.gui.createAccount,
  'order/edit' : orders.gui.edit,
  'account/edit' : handlers.gui.editAccount,
  'payment' :  purchase.gui.pay,
  'successTransaction' : purchase.gui.success,
  'discription' : orders.gui.discription,

  'session/delete' : logout.gui.logout,
  'session/create' : handlers.gui.login,
  'favicon' : handlers.gui.favicon,

  'orders/dashboard' : orders.gui.dashboard,
  'error' : error.gui.error

added features
  password and email is encrypted
  provide a token as soon as user created for the immediate login


HTTP success/error codes used:
	200		Success, request performed as expected.

	201		Created, object created

	400		Bad request

	401		Unauthorized

	403		No permission

	404		Not found

	405		Method not allowed

	413		Requested entity too large

	415		Unsupported media

	422		Validation error

	429		Too many requests

	500		Internal server error, Email error


#Error responses
Errors are returned in JSON, with a top-level errors key containing an array of errors that have been generated (validations can trigger multiple errors).

Each error currently has a message and an errorType.

This error response format is likely to get an overhaul in the near future.

Examples
401 Unauthorised
{
{
    "error": "failed to Validate"
}
} 
422 Unprocessable Entity
{
    "error": "unauthorized entry"
}

#User Authentication
How to utilise user auth to make private API requests
Before making a request using curl, you will need two pieces of information:

user email
user password

curl 
	-H password:*****
	-X POST http://localhost:3000/api/tokens?email=*****@*.com


#Create account
curl -X POST \
  'http://localhost:3000/api/users?email=[your email]' \
  -d '{
"firstName":"****",
"lastName":"*****",
"email":"******@gmail.com",
"phone":"*******",
"address":"[your address]",
"password":"[your password]"
}'

#login to the account
curl -X POST \
  'http://localhost:3000/api/users?email=hasinthashehan768%40gmail.com' \
  -d '{
"firstName":"****",
"lastName":"*****",
"email":"******@gmail.com",
"phone":"*******",
"address":"[your address]",
"password":"[your password]"
}'
