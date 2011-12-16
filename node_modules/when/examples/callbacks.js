var when = require('../when').when;

// Of course, the point of having a 'then' callback is
// That we can do something async and then finally call 'then' when we're done
when("setTimeout is used in an application", function(then) {
  setTimeout(function() {
    then("The function passed to setTimeout should be invoked", true);
  }, 200);  
});

// There is no harm in doing two callbacks, 'when' knows how many asserts to expect and will
// react appropriately
when("setTimeout is used in an application twice in a row", function(then) {
  var firstHasBeenCalled = false;
  setTimeout(function() {    
    then("The function passed to setTimeout with 200 milliseconds should be invoked first", firstHasBeenCalled === false);
    firstHasBeenCalled = true;
  }, 200);  
  setTimeout(function() {
    then("The function passed to setTimeout with 300 milliseconds should be invoked second", firstHasBeenCalled);
  }, 300);  
});

// You can also do as many thens within one callback as you like, obviously
when("setTimeout is used in an application for no apparent reason", function(then) {
  setTimeout(function() {    
    then("2 + 2 still equals 4", 2 + 2 === 4);
    then("2 + 3 still equals 5", 2 + 3 === 5);
    then("2 + 4 still equals 6", 2 + 4 === 6);
    then("2 + 5 still equals 7", 2 + 5 === 7);
    then("2 + 6 still equals 8", 2 + 6 === 8);
  }, 200);  
});
