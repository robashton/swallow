var ConsoleOutput = require('./lib/consoleoutput.js').ConsoleOutput;

var cleanMessageFromCallback = function(statement) {
  var startIndex = statement.indexOf('this.');
  startIndex = startIndex < 0 ? 0 : startIndex + 5;
  var endIndex = statement.indexOf(')', startIndex) + 1;
  return statement.substr(startIndex, endIndex - startIndex).replace(/_/g, ' ');
};

var parseCallbackForExpectedMessages = function(callback) {
  var stringed = callback.toString();
  var components = stringed.split('then(');
  var messages = [];
  for(var i = 1; i < components.length; i++)
    messages.push(cleanMessageFromCallback(components[i]));
  return messages;
};

var when = function(testName, callback) {
  var self = this;
  var statements = [];
  var expectedMessages = parseCallbackForExpectedMessages(callback);
  
  var addStatement = function(statement, valid) {
    statements.push({ valid: valid, text: statement});
    tryAndFinish();
  };

  var tryAndFinish = function() {
    if(statements.length < expectedMessages.length) return;
    when.output.writeWhen(testName);
    for(var i = 0; i < statements.length; i++) {
      printStatement(statements[i]);
    }
    when.output.endWhen();
  };

  var printStatement = function(statement) {
    when.output.writeThen(statement.text, statement.valid);
  };

  var lookupStatementForCurrentFunction = function() {
    return expectedMessages[statements.length];
  };

  var processStatementAsFunction = function(thenFunction, validity) {
    var text = lookupStatementForCurrentFunction();
    thenFunction.call(self, function(valid) {
      addStatement(text, valid);
    });
  };

  when.output.beginWhen();
  callback(function(statement, validity) {
    if(statement instanceof Function)
      processStatementAsFunction(statement, validity);
    else
     addStatement(statement, validity);
  });
};
when.output = new ConsoleOutput();

when.allTestsFinished = function(callback) {
  when.output.whenAllGivensMarkedComplete(callback);
};

when.printReport = function() {
  var failedTestCount = when.output.failedTests;
  var passedTestCount = when.output.passedTests; 
  var total = failedTestCount + passedTestCount;

  if(failedTestCount > 0) {
    var text = '\nTest run failed: (' + passedTestCount + '/' + total + ')';
    console.log(text.red);
  } else {
    var text = '\nTest run passed: (' + passedTestCount + '/' + total + ')';
    console.log(text.green);
  }
};


exports.when = when;
