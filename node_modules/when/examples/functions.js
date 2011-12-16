var when = require('../when').when;

// A function given to the 'then' method is given a 'truth' callback
// And truth should be called *once* with a true or false value
var should_be_true = function(truth) {
  truth(true);
};

var should_be_equal = function(one, two) {
  // We return the function that will be given to 'then'
  return function(truth) {
    // And then we proceed as in the above example at this point, but we have
    // the context given to us from above
    truth(one === two);
  };
};

when("Something awesome happens", function(then) {
  // We can pass in a function to then and it will be invoked
  // and given a callback to invoke when done
  then(should_be_true);

  // moving on from that, 'then' expects a function, but that doesn't stop us 
  // calling a function that also returns a function and passing some context down
  then(should_be_equal("hello", "hello"));
  then(should_be_equal("hello", "goodbye"));
});


