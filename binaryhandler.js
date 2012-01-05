(function() {

  var path = require('path');
  var fs = require('fs');

  module.exports = function(extensions) {
    var self = this;

    extensions = extensions || [
        '.jpg',
        '.png',
        '.wav',
        '.ogg',
        '.mp3'
    ];

    self.handles = function(filename) {
      var extension = path.extname(filename);
      for(var i = 0 ; i < extensions.length; i++) {        
        if(extensions[i] === extension) return true;
      }
      return false;
    };

    self.process = function(input, callback) {
       fs.readFile(input, function(err, data) {
          var translated = new Buffer(data).toString('base64');
          return callback(translated);        
       });
    };
    
  };
  
}).call(this);
