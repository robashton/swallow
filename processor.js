var DirectoryWalker = require('./directorywalker').DirectoryWalker;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');

var Processor = function(directory, inputConfig) {
  this.directory = directory;
  this.inputConfig = inputConfig;
};
util.inherits(Processor, EventEmitter);

Processor.prototype.run = function() {
  var self = this;

  var completedScan = false;
  var pendingCount = 0;
  var directory = this.directory;
  var inputConfig = this.inputConfig;
  var data = {};

  var execute = function() { 
    var walker = new DirectoryWalker(directory);
    completedScan = false;
    pendingCount = 0;

    walker.on('file', function(fullPath) {
      onFileStarted();
      var handler = inputConfig.getHandlerForFile(fullPath);
      var friendlyPath = fullPath.replace(directory, '');
      handler(fullPath, function(transformed) {
        data[friendlyPath] = transformed;
        onFileProcessed(fullPath);
      });
    });
    walker.on('completed', onCompletedScan);
    walker.run(); 
  };

  var onFileStarted = function() {
    pendingCount++;
  };
 
  var onFileProcessed = function(fullPath) {
    self.emit('file', fullPath);        
    pendingCount--;
    tryToFinish();
  };

  var onCompletedScan = function() {
    completedScan = true;
    tryToFinish();
  };

  var tryToFinish = function() {
    if(pendingCount === 0 && completedScan) {
      writeToOutputFile();
    }
  };

  var writeToOutputFile = function() {
    fs.writeFile(inputConfig.out, JSON.stringify(data), function(err) {
      self.emit('completed');
    });
  };

  execute();
};

exports.Processor = Processor;

