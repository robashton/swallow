# When

When is a test runner that allows me to write tests the way I want to, whilst still giving readable output to the console. No process formalisation to be found here, just abstractions written appropriately around your own tests with hook-points for running and managing the asynchronous nature of the tests and delivering readable output.

## An example from one of my projects

```javascript
when("a folder is packaged with default configurations", function() {
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
```

With the output

<img src="http://github.com/robashton/when/raw/master/images/full_example.png">

## Still interested?

Make your test file, and run it with

```
node mytests.js
```

A test file can look like

```javascript
var when = require('when').when;

when("something happens that I want to assert on", function(then) {
  doSomeSharedSetup(function() {
    then("some condition is true", true);
    then("some condition is false", false);
  });
});

when.allTestsFinished(function() {
  when.printReport();
});

```

Where the output would be

<img src="http://github.com/robashton/when/raw/master/images/simple_example.png">

Alternatively when more complicated set-up and asserts with nested callbacks are required, we can push them into a function and then handle all that with the code we'd usually write.

```javascript
when("something happens that i want to assert on", function(then) {
  doSomeSetup(function() {
    then(this.some_value_should_match('some_input'));
    then(this.some_other_value_should_match('something'));  
  });
});
```

<img src="http://github.com/robashton/when/raw/master/images/function_example.png">

## More

Annotated examples can be found in /examples, but ultimately the responsibility of defining the appropriate abstractions around your code to perform the relevant set-up/tear-down/assertions are left to you, the developer - and giving appropriate output is given to the test-runner.


