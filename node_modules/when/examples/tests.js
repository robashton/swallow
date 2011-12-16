var when = require('../when').when;

require('./simple');
require('./functions');
require('./callbacks');
require('./callbacks_and_functions');

when.allTestsFinished(function() {
  when.printReport();
});
