/*
* front-end logic for the application
*
*
*/

//container for the front end applicaiton

window.onload = function(){
const app = {}

app.config = {
  'sessionToken' : false
}

// Ajax client for the restful API
app.client = {};

//Interface for the app making API CALLS
app.client.request = function(headers,queryStringObject,payload,method,path,callback){
  //set Default
  headers = typeof(headers) == "object" && headers !== null? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ["POST","GET","PUT","DELETE"].indexOf(method) > -1 ? method : false;
  payload = typeof(payload) == 'object' && payload !== null ? payload : false;
  //path = typeof(path) == "string" ? path : '/';
  callback = typeof(callback) == "function" ? callback : false;
  queryStringObject = typeof(queryStringObject) == "object" && queryStringObject !== null ? queryStringObject :false;
  //for the each queryString parameter has already been added prepend a new
  // prepare the queryStringObject for sending
  
  let requestUrl = path + '?';
  let counter = 0;
  for (let queryKey in queryStringObject){
    if (queryStringObject.hasOwnProperty(queryKey)){
      counter++;
      //if atleast one queryString parameter has already been added to the string ,prepend new once a with ampresent
      if (counter > 1){
        requestUrl += '&';
      }

      //add the key and value
      requestUrl += queryKey + '=' + queryStringObject[queryKey]
    }
  }
  let xhr = new XMLHttpRequest();
  xhr.open(method,requestUrl,false);
  xhr.setRequestHeader("contentType","application/json");

  //for each header sent and add it to the request
  for (let headerKey in headers){

    if (headers.hasOwnProperty(headerKey)){
      xhr.setRequestHeader(headerKey,headers[headerKey])
    }
  }
  //if there is a current token exist add that to the header
  xhr.onreadystatechange = function(){
    if (xhr.readyState = XMLHttpRequest.DONE){
      let statusCode = xhr.status;
      let responceReturned = xhr.responseText;
      //callback if requested
      if (callback){
          try{
            //let parseResponce = JSON.parse(responceReturned);
            let parseResponce = JSON.parse(responceReturned)
            callback(statusCode,parseResponce);
          }catch(e){
            callback(statusCode,false)
          }
        }
      }
    }



    //send the payload as JSON
    let payloadString = JSON.stringify(payload)
    xhr.send(payloadString);
    //xhr.send();
  }

//get the irrelevent input and init request process
app.bindForms = function(){

  if (document.querySelectorAll("form")){
    let forms = document.querySelectorAll("form")
    forms.forEach(function(currForm){
      currForm.addEventListener('submit',function(event){
        //prevent it from submitting
        event.preventDefault();
        let method = currForm.method.toUpperCase();
        let action = currForm.action;
        let id = currForm.id;

        // Hide the error message (if it's currently shown due to a previous error)
        let w = document.querySelectorAll("#" + id + " .formError")
        document.querySelectorAll("#" + id + " .formError")[0].style.display = "hidden";

        let payload = {}
        let elements = currForm.elements;
        for (let i=0; i<elements.length; i++){
          if ((elements[i].name == '_method') && (['DELETE','PUT'].indexOf(elements[i].value) > -1)){
            method = elements[i].value;
          }
          if (elements[i].type == 'checkbox'){
            if (elements[i].checked){
              if (payload[elements[i].name] !== undefined){
                //payload[elements[i].name].push(elements[i].value)
                payload[elements[i].name][elements[i].name] = elements[i].value;
              }else{
                payload[elements[i].name] = {};
                payload[elements[i].name][elements[i].name] = elements[i].value == 'on' ? true : false;
              }
            }else{
              payload[element[i].name] = elements[i].value;
            }
        }else{
          if (elements[i].name !== ''){
            payload[elements[i].name] = elements[i].value
          }
        }
      }
      let headers = {
        "token" : app.getSessionToken()
      }

      app.client.request(headers,undefined,payload,method,action,function(statusCode,responce){

        if (statusCode != 200 && statusCode != 201){
          document.querySelectorAll("#" + id + " .formError")[0].style.display = "block";
        }else{

          if (id == "createAccount"){
            app.customStore('user',payload.email);
            app.createAccount(responce,payload);
          }
          if (id == "loginForm"){
            app.setSessionToken(responce,payload);            
          }
          if (id == "pay"){
            window.location = "http://localhost:3000/successTransaction"
          }
        }
      })
    })
  })
}
}

//login process to the account
app.loginAccount = function(userData,payload){
//headers,queryStringObject,payload,method,path,callback

  try{
    if (document.querySelector('#loginForm')){
    let loginForm = document.querySelector('#loginForm');


    loginForm.addEventListener('submit',function(e){
      e.preventDefault();
    let userName = loginForm.elements.username.value
    let password = loginForm.elements.password.value
      
        let headers = {
          "password" : password
        };
        let queryStringObject = {
          "email" : userName
        };

        app.client.request(headers,queryStringObject,undefined,"POST",'http://localhost:3000/api/tokens',function(statusCode,tokenData){
    if (statusCode == 200 || statusCode == 201 && tokenData){
      app.setSessionToken(tokenData)
      app.customStore('user',userName);
      window.location = 'orders/dashboard';
    }else{
      window.location = 'session/create';
    }
  })
    })
  }
  } catch (e){
    console.log(e)
  }

}

//get the available items from the Api datastructure and process the display to the screen
app.availableItems = function(){
  if (window.location == 'http://localhost:3000/items/availableItems'){
    let headers = {
      "token" : app.getSessionToken()
    };
    if (app.getSessionToken()){
    app.client.request(headers,undefined,undefined,"GET",'http://localhost:3000/items/availableItems/all',function(statusCode,availableItems){
      if (statusCode == 200 || statusCode == 201 && availableItems){
        app.getAlignment(availableItems,headers)
      }else{
        app.removeLocalStorage();
        window.location = "http://localhost:3000/";
      }
    })
  } else {
    window.location = "http://localhost:3000/";
  }

}
}

//get all the sales, averything on the cart and also exchanges and  details, then displat to the screen
app.dashboard = function(){
  if (window.location == "http://localhost:3000/orders/dashboard"){
      let headers = {
        "token" : app.getSessionToken()
      };
      let tableBody = document.getElementById("dashBoard");
      app.client.request(headers,undefined,undefined,"GET",'http://localhost:3000/api/orders',function(statusCode,responce){
        if (statusCode == 200 || statusCode == 201){
          for (let i=0;i<responce.orders.length;i++){
            responce.orders[i].state = responce.orders[i].state == "In Cart" ? `<button type=\"submit\" class=\"button\" id="${responce.orders[i].productId}" >Buy/Delete</button>` : responce.orders[i].state;
            tableBody.innerHTML += `<tr><td>${responce.orders[i].product}</td><td class="orderId">${responce.orders[i].orderId}</td><td>${responce.orders[i].quantity}</td><td>\$${responce.orders[i].total}</td><td>${responce.orders[i].expraTime}</td><td>${responce.orders[i].state}</td><td class="productId" type=\"hidden\">${responce.orders[i].productId}</td></tr>`
          }
        }
      })
  }
}

//get all the buyable items from the API and display to the screen.
app.getAlignment = async function(arrItems,header){
  let table = document.getElementById("availableItems");
    let queryString = {
    'item' : ""
  }
  for (let item=0; item<arrItems.length; item++){
    queryString['item'] = arrItems[item]
    app.client.request(header,queryString,undefined,"GET",'http://localhost:3000/items/availableItems/get',function(statusCode,details){
      if (statusCode == 200 || statusCode == 201 && details){
        table.innerHTML += 
        `<tr class="items" name="items"><input type="hidden" value="${details.productId}"><td>${item + 1}</td><td>${details.product}</td><td>${details.price}</td><td>${details.discription}</td></tr>`;
      }else{
        console.log('error extracting details');
        app.removeLocalStorage();
        window.location = "http://localhost:3000/";
      }
    })
  }
}

//check weather you are logged in to the account or direct to the main logout screen
app.loginCheck = function(){
  if (app.config.sessionToken != false && app.getSessionToken() != undefined){
    //headers,queryStringObject,payload,method,path,callback
    let headers = {
    "token" : app.getSessionToken()
    }
    app.client.request(headers,undefined,undefined,'GET',"http://localhost:3000/api/token/get",function(statusCode,tokenData){
      if (statusCode == 200 || statusCode == 201){
        //continue
      }else{
        app.removeLocalStorage();
        window.location = "http://localhost:3000/"
      }
    })
  }
}

//get the create account page from the API and display to the screen
app.createAccount = function(userData,payload){
  let headers = {
    "password" : payload.password
  };
  let queryStringObject = {
    "email" : userData.StoredData.email
  };
  app.client.request(headers,queryStringObject,undefined,"POST",'http://localhost:3000/api/tokens',function(statusCode,tokenData){
    if (statusCode == 200 || statusCode == 201 && tokenData){
      app.setSessionToken(tokenData)
      window.location = 'orders/dashboard';
    }else{
      window.location = 'account/create';
    }
  })

}

//reset or set the login variables on the client side
app.setupState = function(){
  let state = false;
  if (app.config.sessionToken == false || app.config.sessionToken == undefined || typeof(app.config.sessionToken) != 'string'){
    state = document.querySelectorAll('.Logout');
  }else{
    state = document.querySelectorAll('.Login');
  }
  state.forEach(function(currentState){
    if (state !== false){
      currentState.parentNode.removeChild(currentState)
    }else{
      currentState.parentNode.removeChild(currentState)
    }
  })
}

//
app.tokenAttach = function(){
  let aEle = document.querySelectorAll("a Login");
  aEle.forEach(function(currentEle){
    if (app.config.sessionToken !== false){
      currentEle.href += "v1/" + app.config.sessionToken;
    }else{
      currentEle.href += "v1/user";
    }
  })
}

// get the token from the actual browser and bind to the client side js variable[app.config]
app.tokenImport =function(){
  let token = app.getSessionToken();
  app.config.sessionToken = token;
}

//send the API request and confirm the session token is correct and valid
app.confirmToken = function(sessionToken = app.config.sessionToken){
  let allowPage = ["http://localhost:3000/","http://localhost:3000/account/create","http://localhost:3000/session/create"]
  let token = typeof(sessionToken) == 'string' ? sessionToken : false;
  if (sessionToken) {
    //continue
  }else{
    app.removeLocalStorage()
    if (allowPage.indexOf(window.location.href) == -1){
      window.location = 'http://localhost:3000/';

    }
  }
}

//process the logout process in the client side and also the API side
app.logout = function(){
  let link = document.querySelector("#logout");
  //headers,queryStringObject,payload,method,path,callback
  let headers = {'token' : app.config.sessionToken};
  try{
  link.addEventListener('click',function(e){
      e.preventDefault();
      app.client.request(headers,undefined,undefined,'GET',"http://localhost:3000/api/logout",function(statusCode,err){
        if (statusCode == 200 || statusCode == 201){
          app.removeLocalStorage();
          window.location = 'http://localhost:3000/';
        } else {
          window.location = 'http://localhost:3000/error';
        }
      });
  })
  }catch(e){
    //continue;
  }
}

//if user click one the product then direct the discription page then store the product what user was looking for
app.look = function(){
  if (window.location == "http://localhost:3000/items/availableItems"){
  let link = document.querySelectorAll("#availableItems tr");
  //headers,queryStringObject,payload,method,path,callback
  try{
    for (let currLink=0; currLink<link.length; currLink++){
      link[currLink].addEventListener('click',function(e){
          e.preventDefault();
          let item;
          for (let ele=0; ele<link[currLink].childNodes.length;ele++){
            if (link[currLink].childNodes[ele].type == "hidden"){
              item = link[currLink].childNodes[ele].value;
             // break;
            }
          }
          app.customStore('watch',item);
          window.location = "http://localhost:3000/discription";
      })
   }
  }catch(e){
    console.log(e)
    //continue;
  }
  }
}

//buy the item[buy request and store in the shopping cart]
app.buy = function(){
  if (window.location == "http://localhost:3000/discription"){
    let itemPrice = document.querySelector("#itemPrice");
    let addCart = document.querySelector("#addCart");
    let buyNow = document.querySelector("#buyNow");
 //   let productId = document.querySelector("#proId").innerHTML;
    let productId = app.getCustomItem('watch');

    let headers = {'token' : app.config.sessionToken};
  try{

    buyNow.addEventListener("click",function(e){
      let quentity = document.querySelector("#quentity").value;
      e.preventDefault();
      let payload = {
        'item' : productId,
        'quantity' : quentity
      }
      let headers = {
        'token' : app.getSessionToken()
      }
      app.client.request(headers,undefined,payload,'POST',"http://localhost:3000/api/orders",function(statusCode,err){
          if (statusCode == 200 || statusCode == 201){
            app.customStore('buyNow',err.success.orderId);
            window.location = 'http://localhost:3000/payment';
          } else {
            console.log(err);
            //app.removeLocalStorage();
            window.location = 'http://localhost:3000/error';
          }

        })
    })





    addCart.addEventListener("click",function(e){
      let quentity = document.querySelector("#quentity").value;
      e.preventDefault();

       let payload =  {
          'item' : productId,
        'quantity' : quentity
      }
      let headers = {
        'token' : app.getSessionToken()
      }
      app.client.request(headers,undefined,payload,'POST',"http://localhost:3000/api/orders",function(statusCode,err){

          if (statusCode == 200 || statusCode == 201){

          } else {
            //app.removeLocalStorage();
            //window.location = 'http://localhost:3000/error';
          }
          
      });
    })
   
   
  }catch(e){
    console.log(e)
    //continue;
  }
  }
}

//generely store new items into the localstorage
app.customStore = function(key,buyNowData){
  try{
    localStorage.setItem(key,buyNowData)
  }catch(e){
    //continue;
  }
}

// remove the token from the browser localstorage
app.removeLocalStorage = function(){
  try{
     localStorage.removeItem('token');
  }catch(e){
    console.log(e)
  }
}

//store the session token inside the browser localstorage
app.setSessionToken = function(token){
  app.config.sessionToken = token.success.token;
  localStorage.setItem('token',token.success.token)
  return false
}

//get the session token from the localstorage
app.getSessionToken = function(){
  let token = localStorage.getItem('token');
  return token
}

//get custom localstorage tiem from the localstorage
app.getCustomItem = function(key){
  let item = localStorage.getItem(key);
  return item;
}

//fill the order id automaticly
app.settleReqiredItems = function(){
  if (window.location == "http://localhost:3000/payment"){
    let orderId = document.querySelector("[name=orderId]");
    let userName = document.querySelector("[name=email]");
    orderId.value = app.getCustomItem("buyNow");
    userName.value = app.getCustomItem("user");
  }
}

//add selected item to the cart
app.cart = function(){
  if (window.location == "http://localhost:3000/orders/dashboard"){
    let button = document.querySelectorAll("button");
    for (let i=0; i < button.length; i++){
      button[i].addEventListener("click",function(e){
        e.preventDefault();
        let parent = button[i].parentElement.parentElement;
        parent = parent.children;
        //let itemLay = ["Product","orderId","quantity","total","state","expraDate"];
        let itemLay = "";
        let productLay = "";
        for (let j=0; j<parent.length; j++){
          if (parent[j].className == "orderId"){
            itemLay = parent[j].innerHTML;
          }
          if (parent[j].className == "productId"){
            productLay = parent[j].innerHTML;
          }
        }
        app.customStore('buyNow',itemLay);
        app.customStore('buyNowEdit',productLay);
        window.location = "http://localhost:3000/order/edit"
      })
    }
  }
}

//loadup the page where discribe the item more consisly
app.discription = function(){
  try{
    if (window.location == "http://localhost:3000/discription"){
      //headers,queryStringObject,payload,method,path,callback
      let headers = {
        "token" : app.getSessionToken()
      }
      let queryStringObject = {
        "item" : app.getCustomItem("watch")
      }

      app.client.request(headers,queryStringObject,undefined,"GET",'http://localhost:3000/items/availableItems/get',function(statusCode,itemData){
        if (statusCode == 200 || statusCode == 201){
          //apply the itemdata to the html file
          //itemImage,itemName,itemDiscription,itemPrice,expraDate,quentity,submit
          //{product: "butter cake", price: 11, expraTime: 5500000, productId: "4hd46je9s0", discription: "Cake is a  of sweet dessert that is typically bake…tries, meringues, custards, and pies. enjoy cake."}
          let img = document.getElementById("image");
          let optionArr = ["itemName","itemDiscription","itemPrice","expraDate"];
          let itemName = document.getElementById("itemName").innerHTML = itemData.product;
          let itemDiscription = document.getElementById("itemDiscription").innerHTML = itemData.discription;
          let itemPrice = document.getElementById("itemPrice").innerHTML = itemData.price;
          let expraDate = document.getElementById("expraDate").innerHTML = itemData.expraTime;
          let productId = document.getElementById("proId").innerHTML = itemData.productId;
          let itemImage = document.getElementById("itemImage");
          itemImage.src = `http://localhost:3000/public/images/${itemData.productId}.jpg`;
        }
      })
    }
  }catch(e){
    console.log(e);
  }
}

// edit the order that you created
app.orderEdit = function(){
 if (window.location == "http://localhost:3000/order/edit"){
  let orderIdEle = document.querySelector("[name=orderId]");
  let deleteBtn = document.querySelector("#deleteOrder");
  let editOrder = document.querySelector("#submit");
  let orderId = app.getCustomItem("buyNow");
  
  //quentity = quentity.options[quentity.selectedIndex].value;
  orderIdEle.value = orderId;
  deleteBtn.addEventListener('click',function(event){
    event.preventDefault();
    let headers = {
      "token" : app.getSessionToken()
    }
    let queryStringObject = {
      "orderId" : orderId
    }
    app.client.request(headers,queryStringObject,undefined,"DELETE",'http://localhost:3000/api/orders',function(statusCode,orderData){
      if (statusCode == 200 || statusCode == 201 && orderData){
        window.location = 'orders/dashboard';
      }else{
        app.removeLocalStorage();
        window.location = 'account/create';
      }
    })
  })

  editOrder.addEventListener('click',function(event){
    let quentity = document.getElementById("quentity");
    quentity = quentity.value;
    event.preventDefault();
    let headers = {
      "token" : app.getSessionToken()
    }
    let payload = {
      "quantity" : quentity,
      "orderId" : app.getCustomItem("buyNow"),
      "productId" : app.getCustomItem("buyNowEdit")
    }
    app.client.request(headers,undefined,payload,"PUT",'http://localhost:3000/api/orders',function(statusCode,orderData){
      if (statusCode == 200 || statusCode == 201 && orderData){
        window.location = 'payment';
      }else{
        app.removeLocalStorage();
        window.location = 'error';
      }
    })
  })

 }
}

//if user either enter the information wrong or API occur an error pops on the screen then this function capable of reseting the error message when it's reloaded. 
app.resetErr = function(){
  let element = document.querySelectorAll(".formError")
  for (let i=0; i<element.length; i++){
    element[i].style.display = 'none';
  }
}

//menage the navigation bar as to the state of the user where who logged in.
app.inOut = function(token = app.config.sessionToken){
  let elements = document.querySelectorAll('.Logout');
  elements.forEach(function(element){
    element.classList += "display";
  })
}

//menage the navigation bar as to the state of the user where who logged out.
app.inOut = function(token = app.config.sessionToken){
  let elements = document.querySelectorAll('.Login');
  elements.forEach(function(element){
    element.classList += "displayOn";
  })
}

//inittiate the whole nessary start up functions
app.init = function(){
  console.log('one');
  //store token inside the app
  app.tokenImport();
  //confirm token
  app.confirmToken();
  //remove error message been show off
  app.resetErr()
  //attach the token to every "a" Element
  app.tokenAttach();
  //remove login and log out classes accoding to the state
  app.setupState();
  //init click function
  app.logout();
  //get the dashboard
  app.dashboard();
  app.settleReqiredItems();
  //log in state if exist
  app.loginAccount();
  //get the available items
  app.availableItems();
  //edit account
  app.buy();
  //form manupulation for sending requests
  app.bindForms();
  //order Edit,verify and delete
  app.orderEdit();
  //buying and cart form
  app.cart();
  //watch list
  app.look();
  //load the discription
  app.discription();
  //login check
  app.loginCheck();
  console.log('two');
}

app.init();


}

