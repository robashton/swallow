var colors = require('colors');

var ConsoleOutput = function() {
  this.passedTests = 0;
  this.failedTests = 0;
  this.completedCallback = null;
  this.pendingGivens = 0;
};

ConsoleOutput.prototype = {
  beginWhen: function() {
    this.pendingGivens++;
  },
  writeWhen: function(statement) {
    console.log('\n' + statement.cyan);
  },
  endWhen: function() {
    this.pendingGivens--;
    this.tryToFinish();
  },
  whenAllGivensMarkedComplete: function(callback) {
    this.completedCallback = callback;
    this.tryToFinish();
  },
  writeThen: function(statement, passed) {
    if(passed) {
      this.passedTests++;
      console.log('\t ' + statement.green);
    } else {
      this.failedTests++;
      console.log('\t ' + statement.red);
    }
  },
  tryToFinish: function() {
    if(this.pendingGivens === 0 && this.completedCallback)
      this.completedCallback();
  }
};

exports.ConsoleOutput = ConsoleOutput;

