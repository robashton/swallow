var vows = require('vows'),
    assert = require('assert'),
    Processor = require('../processor').Processor,
    Config = require('../config').Config;

var SwallowContext = function() {
  var self = this;
  var config = {
    tests: {}
  };

  self.buildFrom = function(sourceDir) {
    config.sourceDir = sourceDir;
    return self;
  };

  self.into = function(destinationFile) {
    config.destinationFile = destinationFile;
    return self;
  };

  self.verifyFile = function(filename) {
    config.tests["File contents should be the same " + filename] = function() {
      verifyFileIsTheSame(filename);
    };  
    return self;
  };

  self.build = function() {
    config.tests.topic = buildPackage;
    return config.tests;
  };

  var buildPackage = function() {
    var context = this;
    var swallowConfig = new Config({
        baseDir: './',
        in: config.sourceDir,
        out: config.destinationFile        
    });
    swallowConfig.forEachInput(function(dir, input) {      
      var processor = new Processor(dir, input);
      processor.on('completed', context.callback);
      processor.run();
    });
  };

  var verifyFileIsTheSame = function() {
    assert.ok(true);
  };
};

vows.describe("With defaults").addBatch({
  "When packaging an entire folder": {
    "Known file types can be round tripped": new SwallowContext()
       .buildFrom('./in/assets')
       .into('./assets.json')
       .verifyFile('./assets/textures/bars.jpg')
       .verifyFile('./assets/shaders/particles.shader')
       .verifyFile('./assets/shaders/particles.fragment')
       .verifyFile('./assets/sounds/pigeon.wav')
       .verifyFile('./assets/models/hovercraft.json')
       .build()
  }
}).export(module);
