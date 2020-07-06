/* this lib does all the html, js and css manupiulations for the fruther rendering in client side.
*/

const manupiulate = {};
const fs = require('fs');
const path = require('path');
const _helpers = require('./helpers');

manupiulate.baseDir = path.join(__dirname,"/../public/");

manupiulate.public = {};

manupiulate.public.js = function(data,callback){
	//callback(200,"console.log(\"tttt\")","js")trimedPath
	let request = data.trimedPath.indexOf("public/jsManupiulation/") > -1 ? data.trimedPath.replace("public/jsManupiulation/","") : false;
	console.log(request,manupiulate.baseDir + "jsManupiulation/" + request)
	return new Promise(function(resolve,reject){
		fs.readFile(manupiulate.baseDir + "jsManupiulation/" + request, "utf-8", function(err,jsData){
			if (!err && jsData){
				console.log("1 step")
				resolve(jsData);
			}else{
				fs.readFile(manupiulate.baseDir + "jsManupiulation/" + "app.js", "utf-8", function(err,jsData){
					console.log("condijfdjfdshjk")
					if (!err && jsData){
						reject(jsData)
					}else{
						reject("console.log(\"failed to read the js file\")")
					}
				})
			}
		})
	})
	.then(jsData => {
		return new Promise(function(resolve,reject){
		fs.readFile(manupiulate.baseDir + "jsManupiulation/" + "_main.js", "utf-8", function(err,jsHeadData){
			if (!err && jsHeadData){
				jsHeadData += jsData;
				console.log("2 step");
				resolve(jsHeadData)
			}else{
				fs.readFile(manupiulate.baseDir + "jsManupiulation/" + "app.js", "utf-8", function(err,jsHeadData){
					console.log("condijfdjfdshjk")
					if (!err && jsHeadData){
						reject(jsHeadData)
					}else{
						reject(callback("console.log(\"failed to read the js file\")"))
					}
				})
			}
		})
	  })
	})
	.then(jsData => {
		return new Promise(function(resolve,reject){
			fs.readFile(manupiulate.baseDir + "jsManupiulation/" + "_footer.js", "utf-8", function(err,jsFooterData){
				if (!err && jsFooterData){
					jsData += jsFooterData;
					console.log("3 step")
					resolve(callback(200,jsData,"js"))
				}else{
					fs.readFile(manupiulate.baseDir + "jsManupiulation/" + "app.js", "utf-8", function(err,jsHeadData){
						console.log("condijfdjfdshjk")
						if (!err && jsFooterData){
							reject(jsFooterData)
						}else{
							reject("console.log(\"failed to read the js file\")")
						}
					})
				}
			})
		})
	})
	.catch(e => {
		//console.log(e);
		callback(200,e,"js")
	})

}


module.exports = manupiulate;

