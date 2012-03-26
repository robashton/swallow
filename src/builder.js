module.exports = (function(require) {

  var EventEmitter = require('events').EventEmitter;
  var _ = require('underscore');
  var DirectoryWalker = require('./directorywalker');
  var fs = require('fs');
  
  var Builder = function(cfg, defaults) {
    EventEmitter.call(this);
    this.cfg = cfg;
    this.defaults = defaults;
    this.data = {};
    this.pending = 0;
    this.completed = false;
    this.cfg.extraHandlers = this.cfg.extraHandlers || [];
  };

  Builder.prototype = {  

    run: function() {
      var oldWd = process.cwd();
      process.chdir(this.cfg.root || oldWd);

      var root = new DirectoryWalker(this.cfg.in);
      var self = this;
      
      root.on('error', function(err) {
        self.emit('error', err);
        process.chdir(oldWd);
      });
      
      root.on('completed', function() {
        self.completed = true;
        process.chdir(oldWd);
      });
            
      root.on('file', function(path) {
        self.processFile(path);
      });
      
      root.run();
    },
    
    writeOutput: function() {
      var self = this;
      var text = JSON.stringify(this.data);

      fs.writeFile(this.cfg.out, text, 'utf8', function(err) {
        if(err) { self.emit('error', err); return; }
        self.emit('completed');      
      });
    },
    notifyPendingDecrease: function() {
       this.pending--;
       if(this.pending === 0 && this.completed) {
        
        this.writeOutput();
       }
    },
    processFile: function(path) {
      var self = this;
      this.pending++;
      this.findHandlerForFile(path, function(handler) {
        if(!handler) {          
          self.notifyPendingDecrease();
          return;
        } 
        handler.handle(path, function(err, data) {
          if(err) { self.emit('error', err); return; }
          self.data[path] = data;
          self.notifyPendingDecrease();       
        });
      });
    },
    
    findHandlerForFile: function(path, cb) {
      var found = false;
      var pendingHandlers = this.defaults.handlers.length + this.cfg.extraHandlers.length;
      
      var investigateHandler = function(handler) {
        handler.valid(path, function(valid) {
          pendingHandlers--;
          if(!found && valid) {
            found = true;
            cb(handler);
          } else if(pendingHandlers === 0 && !found) {;
            cb(null);
          }
        });
      };
      
      for(var i in this.defaults.handlers) {        
        var handler = this.defaults.handlers[i];        
        investigateHandler(handler);
      }
      
      for(var i in this.cfg.extraHandlers) {
        var handler = this.cfg.extraHandlers[i];        
        investigateHandler(handler);
      }
    }
  };
  _.extend(Builder.prototype, EventEmitter.prototype);
  return Builder;

}).call(this, require);


