var when = require('../when').when;

when("Something happens in my head", function(then) {
  then("I expect to think of awesome things to do", true);
  then("I expect to hear voices (expected to fail)", false);
});
