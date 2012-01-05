var fs = require('fs');
var path = require('path');
var BinaryHandler = require('./binaryhandler');
var JsonHandler = require('./jsonhandler');

var Config = function(data) {
  var self = this;

  data.in = path.join(data.baseDir, data.in);
  data.out = path.join(data.baseDir, data.out);
  var handlers = data.handlers || [
    new BinaryHandler(),
    new JsonHandler()  
  ];
  
  self.forEachInput = function(callback) {
    callback(data.in, {
      out: data.out,
      getHandlerForFile: self.getHandlerForFile
    });
  };  

  self.getHandlerForFile = function(filename) {
    for(var i in data.handlers) {
      var handler = data.handlers[i];
      if(handler.handles(filename)) return handler.process;
    }
    return unknownHandler;
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


