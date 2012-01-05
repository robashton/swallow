var fs = require('fs');
var path = require('path');

var Config = function(data) {
  var self = this;

  data.in = path.join(data.baseDir, data.in);
  data.out = path.join(data.baseDir, data.out);
  
  self.forEachInput = function(callback) {
    callback(data.in, {
      out: data.out,
      getHandlerForFile: self.getHandlerForFile
    });
  };  

  self.getHandlerForFile = function(filename) {
    var extension = path.extname(filename);
    switch(extension) {
      case '.jpg':
      case '.png':
      case '.wav':
      case '.ogg':
      case '.mp3':
        return processBinaryHandler;
      default:
        return unknownHandler;
    };
  };

  var processBinaryHandler = function(input, callback) {
     fs.readFile(input, function(err, data) {
        var translated = new Buffer(data).toString('base64');
        return callback(translated);        
     });
  };

  var unknownHandler = function(input, callback) {
    return callback('');
  };  
};

Config.LoadFrom = function(filename, callback) {
  fs.readFile(filename, function(err, data) {
    if(err) 
      return callback(err);
    var input = JSON.parse(data);
    input.baseDir = input.baseDir || path.dirname(filename);
    var config = new Config(input);
    
    callback(null, config);
  });
};

exports.Config = Config;


