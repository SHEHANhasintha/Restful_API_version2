/*
 * logout
*/

const error = {};
const _helpers = require('./helpers');
error.gui = {};
error.gui.error = function(data,callback){
	  //reject no get method request
  if ((data.method) == 'get'){
    _helpers.getTemplate("error",function(err,templateData){
      if (!err && templateData){
        let renderInfo = {

        }
        _helpers.universalRender(templateData,renderInfo,function(err,universalData){
          if (!err && universalData){
            callback(200,universalData,"html")
          }else{
            callback(500,"data rendering error at universalRender",'plain')
          }
        })
      }else{
        callback(500,"system Error occured at template Read",'plain')
      }
    })
  }else{
    callback(404,"invalid method",'plain')
  }
}
module.exports = error;
