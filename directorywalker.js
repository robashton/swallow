var fs = require('fs');
var path = require('path');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var DirectoryWalker = function(directory) {
  EventEmitter.call(this);

  this.directory = directory;
};
util.inherits(DirectoryWalker, EventEmitter);

DirectoryWalker.prototype.handleError = function(err) {
  this.emit('error', err);
};

DirectoryWalker.prototype.run = function() {
  var self = this;

  var directoryChildren = null;
  var processedCount = 0;
  var directory = self.directory;

  var onDirectoryRead = function(err, children) {
    if(err)
      return self.handleError(err);

    directoryChildren = children;
    processedCount = 0;
    self.emit('started'); 
    processChildren();     
  };

  var processChildren = function() {
    for(var i in directoryChildren) {
      processChild(directoryChildren[i]);
    }
  };

  var processChild = function(child) {
    var fullPath = path.join(directory, child);
    fs.stat(fullPath, function(err, stat) {
      if(stat && stat.isDirectory())
        processChildDirectory(fullPath);
      else
        processChildFile(fullPath);
    }); 
  };

  var processChildDirectory = function(fullPath) {
    self.emit('directory', fullPath);
    var walker = new DirectoryWalker(fullPath);
    walker.on('completed', onChildWalkerCompleted);
    walker.on('file', onChildFile);
    walker.run();
  };

  var onChildWalkerCompleted = function() {
    increaseProcessedCount();
  };

  var onChildFile = function(fullPath) {
    self.emit('file', fullPath);
  };

  var processChildFile = function(fullPath) {
    self.emit('file', fullPath);
    increaseProcessedCount();
  };

  var increaseProcessedCount = function() {
    processedCount++;
    if(processedCount === directoryChildren.length)
      self.emit('completed');
  };

  var handleError = function(err) {
    return self.emit('error', err);
  };

  fs.readdir(directory, onDirectoryRead);
};

exports.DirectoryWalker = DirectoryWalker;


