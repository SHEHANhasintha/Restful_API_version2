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
  console.log('ok')
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

app.dashboard = function(){
  if (window.location == "http://localhost:3000/orders/dashboard"){
      let headers = {
        "token" : app.getSessionToken()
      };
      let tableBody = document.getElementById("dashBoard");
      app.client.request(headers,undefined,undefined,"GET",'http://localhost:3000/api/orders',function(statusCode,responce){
        if (statusCode == 200 || statusCode == 201){
          for (let i=0;i<responce.orders.length;i++){
            tableBody.innerHTML += `<tr><td>${responce.orders[i].product}</td><td>${responce.orders[i].productId}</td><td>${responce.orders[i].quantity}</td><td>\$${responce.orders[i].total}</td><td>${responce.orders[i].state}</td><td>${responce.orders[i].expraTime}</td></tr>`
          }
        }
      })
  }
}



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

app.tokenImport =function(){
  let token = app.getSessionToken();
  app.config.sessionToken = token;
}

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

app.logout = function(){
  let link = document.querySelector("#logout");
  //headers,queryStringObject,payload,method,path,callback
  let headers = {'token' : app.config.sessionToken};
  try{
  link.addEventListener('click',function(e){
      e.preventDefault();
      app.client.request(headers,undefined,undefined,'GET',"http://localhost:3000/api/logout",function(statusCode,err){
        console.log(statusCode,err);
        if (statusCode == 200 || statusCode == 201){
          console.log(err);
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

app.buy = function(){
  if (window.location == "http://localhost:3000/items/availableItems"){
  let link = document.querySelectorAll("#availableItems tr");
  //headers,queryStringObject,payload,method,path,callback
  console.log(link[1].childNodes[0].value,'uuuuuuuuuuuuyyyyyyyyyyyyyyyyy')
  let headers = {'token' : app.config.sessionToken};
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
          let payload = {
            'item' : item,
            'quantity' : 2
          }
          console.log(payload,headers,'tttttrrrrrrettttttt')
          app.client.request(headers,undefined,payload,'POST',"http://localhost:3000/api/orders",function(statusCode,err){
            console.log(statusCode,err);
            if (statusCode == 200 || statusCode == 201){
              console.log(err.success.orderId);
              app.customStore('buyNow',err.success.orderId);
              window.location = 'http://localhost:3000/payment';
            } else {
              console.log(err);
              //app.removeLocalStorage();
              window.location = 'http://localhost:3000/error';
            }
          });

      })
   }
  }catch(e){
    console.log(e)
    //continue;
  }
  }
}

app.customStore = function(key,buyNowData){
  try{
    localStorage.setItem(key,buyNowData)
  }catch(e){
    //continue;
  }
}

app.removeLocalStorage = function(){
  try{
     localStorage.removeItem('token');
  }catch(e){
    console.log(e)
  }
}

app.setSessionToken = function(token){
  app.config.sessionToken = token.success.token;
  localStorage.setItem('token',token.success.token)
  return false
}

app.getSessionToken = function(){
  let token = localStorage.getItem('token');
  return token
}

app.getCustomItem = function(key){
  let item = localStorage.getItem(key);
  return item;
}

app.settleReqiredItems = function(){
  if (window.location == "http://localhost:3000/payment"){
    let orderId = document.querySelector("[name=orderId]");
    let userName = document.querySelector("[name=email]");
    orderId.value = app.getCustomItem("buyNow");
    userName.value = app.getCustomItem("user");
  }
}

//remove error message for the fresh start
app.resetErr = function(){
  let element = document.querySelectorAll(".formError")
  for (let i=0; i<element.length; i++){
    element[i].style.display = 'none';
  }
}

app.inOut = function(token = app.config.sessionToken){
  let elements = document.querySelectorAll('.Logout');
  elements.forEach(function(element){
    element.classList += "display";
  })
}

app.inOut = function(token = app.config.sessionToken){
  let elements = document.querySelectorAll('.Login');
  elements.forEach(function(element){
    element.classList += "displayOn";
  })
}

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

    //login check
  app.loginCheck();
  console.log('two');
}

app.init();


}

