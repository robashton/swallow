var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Processor = require('./processor').Processor;

var Runner = function(config) {
  this.config = config;
};
util.inherits(Runner, EventEmitter);

Runner.prototype.run = function() {
  var self = this;
  var processorCount = 0;
  var config = this.config;

  var onProcessorCompleted = function() {
    processorCount--;
    if(processorCount === 0)
      self.emit('completed');
  };

  var processInput = function(dir, input) {
    var processor = new Processor(dir, input);
    processorCount++;
    processor.on('completed', onProcessorCompleted);
    processor.run();
  };
  config.forEachInput(processInput);
};

exports.Runner = Runner;
