var fs = require('fs');
var path = require('path');
var util = require('util');

var Config = require('./config').Config;
var Processor = require('./processor').Processor;

var configPath = process.argv[2];

var onFileProcessed = function(fullPath) {
  console.log('Processed: ' + fullPath);
};

var onProcessorCompleted = function() {
  console.log('Completed');
};

var processInput = function(dir, input) {
  var processor = new Processor(dir, input);
  processor.on('file', onFileProcessed);
  processor.on('completed', onProcessorCompleted);
  processor.run();
};

Config.LoadFrom(configPath, function(err, config) {
  if(err) throw err;
  config.forEachInput(processInput);
});
