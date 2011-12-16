var   when = require('when').when
     ,swallowTest = require('./common').swallowTest
     ;

when("a folder is packaged with default configurations", function(then) {
  swallowTest()
    .buildFrom('./in/assets')
    .into('./tmp/test_one.json')
    .build(function() {
        then(this.file_should_be_round_tripped_correctly('./assets/textures/bars.jpg'));
        then(this.file_should_be_round_tripped_correctly('./assets/shaders/particles.shader'));
        then(this.file_should_be_round_tripped_correctly('./assets/shaders/particles.fragment'));
        then(this.file_should_be_round_tripped_correctly('./assets/sounds/pigeon.wav'));
        then(this.file_should_be_round_tripped_correctly('./assets/textures/bars.jpg'));
        then(this.file_should_be_round_tripped_correctly('./assets/models/hovercraft.json'));
    });
});

when.allTestsFinished(function() {
  when.printReport();
});
