//jshint esversion: 6
module.exports.getDate = function (){

    var today = new Date();
      var options = {
        weekDay : "long",
        day:"numeric",
        month:"long"
      }
      return today.toLocaleString("en-us", options);
      
    };



