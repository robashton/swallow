var when = require('../when').when,
    fs = require('fs');

// Functions are only really useful if we have complicated set-up code that we want
// to push into appropriate methods/objects to re-use across tests
// And especially when that set-up code requires the use of a multitude of callbacks


////
// This is a helper object, scroll down for the tests
////
var writeFileToDisk = function() {
  var self = this;
  var filename = null;
  var writtenValue = null;

  var performAction = function(callback) {
    // Perform the action itself which is going to be async and crazy
    fs.writeFile(filename, writtenValue, 'utf8', function() { returnAsserts(callback); });
  };
  
  var returnAsserts = function(callback) {          
    // When the action has been performed, construct the asserts that are
    // valid for this operation (this could be a separate object rather than a literal)    
    var asserts = {

      // Asserts are written to be human readable
      file_was_written_correctly: function(truth) {

        // And like before, it's all async and that's fine for us
        fs.readFile(filename, 'utf8', function(err, readValue) {
          truth(readValue === writtenValue);
        });
      }
    };
    callback.call(asserts);
  };

  self.withName = function(value) {
    filename = value;
    return self;
  };

  self.withValue = function(value) {
    writtenValue = value;
    return self;
  };
  
  self.go = function(callback) {
    performAction(callback);
    return self;
  };
  return self;
};


// For example, an assert that requires an async action like reading a file
when("we write data to a file", function(then) {
  var writtenValue = 'hello',
      writtenFile = './tmp/test.txt';

  // This is async
  fs.writeFile(writtenFile, writtenValue, 'utf8', function() {

    // But as seen before, we can invoke a 'then' after async calls are made
    then(file_should_contain_written_value);
  });

  // This will be invoked by 'then' and given the truth object
  var file_should_contain_written_value = function(truth) {
    
    // We can go ahead and make a call to an async method
    fs.readFile(writtenFile, 'utf8', function(err, readValue) {

      // And call into the truth once we've done this
      truth(readValue === writtenValue);
    });
  };
});

// Obviously this doesn't promote a massive amount of re-use (and in this trivial example that's fine)
// But often we might want to create some form of test builder and appropriate test context to go with it
// This is a pointless example to use, as it's a lot of code to write for a simple file test! But if you're
// performing end-to-end integration testing on your app this will be beneficial
when('we write data to a file', function(then) {

  // So we have a test helper we've defined for our codebase
  writeFileToDisk()
      .withName('./tmp/test2.txt')
      .withValue('hello')
      .go(function() {
        // And our test helper invokes this callback with some form of context (or passes a context in)
        // Like most things here, this choice is left up to the developer
        then(this.file_was_written_correctly);
      });
});


