(function() {

  var path = require('path');
  var fs = require('fs');

  module.exports = function() {
    var self = this;

    self.handles = function(filename) {
      var extension = path.extname(filename);
      return extension === '.json';
    };

    self.process = function(input, callback) {
       fs.readFile(input, function(err, data) {
          return callback(data);        
       });
    };
    
  };
  
}).call(this);
