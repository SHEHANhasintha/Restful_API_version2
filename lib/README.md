pizza_delivary_company_API
*  Author: Shehan Hasintha [Explorer]
*  Date: 2018- nov
* Technology stack => JavaScript[ES5,ES6,ES7,ES8]
*  Tested: manualy tested all ==by== @POSTMAN
######handlers
| ~ @handlers__
   |- @users___
      |- POST
      |- GET
      |- PUT
      |- DELETE
| ~ @handlers__
    |- @tokens__
      |- POST
      |- GET
      |- PUT
      |- DELETE
| ~ @handlers__
    |- ping
| ~ @handlers__
    |- notFound

#orders
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



//documentation completed
workers [done]
handlers [done]
server [done]
data [done]
paymentHandling [done]
logout [done]
orders[done]
helpers[done]
logs[done]
availableItems [done]

create user => create token

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

      | ~ @handlers__
          |- @users___
             |- POST
             |- GET
             |- PUT
             |- DELETE
      | ~ @handlers__
           |- @tokens__
             |- POST
             |- GET
             |- PUT
             |- DELETE
      | ~ @handlers__
           |- ping
      | ~ @handlers__
           |- notFound

*CLI - command line tool
typein "man" or "help" on the command prompt
