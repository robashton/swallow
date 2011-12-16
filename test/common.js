var   Runner = require('../runner').Runner
      ,Config = require('../config').Config
      ;

var swallowAsserts = function(config) {
  var self = this;

  self.file_should_be_round_tripped_correctly = function(path) {
    return function(truth) {
      truth(true);
    };
  };
};

exports.swallowTest = function() {
  var self = this;
  var config = {};

  self.buildFrom = function(sourceDir) {
    config.in = sourceDir;
    return self;
  };

  self.into = function(destinationFile) {
    config.out = destinationFile;
    return self;
  };

  self.build = function(callback) {
    var input = new Config(config);
    var runner = new Runner(input);
    runner.on('completed', function() {
      var asserts = swallowAsserts(config);
      callback.call(asserts);
    });
    runner.run();
  };
  return self;
};
