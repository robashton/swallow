var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var path = require('path');

var swallow = (function() {

  var Package = function(data) {
    this.data = data;
  };
  
  Package.prototype = {
  
  };
  
  var DirectoryWalker = function(directory) {
    EventEmitter.call(this);
    this.directory = directory;
  };


  DirectoryWalker.prototype = {
    handleError: function(err) {
      this.emit('error', err);
    },
    run: function() {
    
      var self = this;

      var directoryChildren = null;
      var processedCount = 0;
      var directory = self.directory;

      var onDirectoryRead = function(err, children) {
        if(err)
          return self.handleError(err);

        directoryChildren = children;
        processedCount = 0;
        self.emit('started'); 
        processChildren();     
      };

      var processChildren = function() {
        for(var i in directoryChildren) {
          processChild(directoryChildren[i]);
        }
      };

      var processChild = function(child) {
        var fullPath = path.join(directory, child);
        fs.stat(fullPath, function(err, stat) {
          if(stat && stat.isDirectory())
            processChildDirectory(fullPath);
          else
            processChildFile(fullPath);
        }); 
      };

      var processChildDirectory = function(fullPath) {
        self.emit('directory', fullPath);
        var walker = new DirectoryWalker(fullPath);
        walker.on('completed', onChildWalkerCompleted);
        walker.on('file', onChildFile);
        walker.run();
      };

      var onChildWalkerCompleted = function() {
        increaseProcessedCount();
      };
      
      var onChildFile = function(fullPath) {
        self.emit('file', fullPath);
      };

      var processChildFile = function(fullPath) {
        self.emit('file', fullPath);
        increaseProcessedCount();
      };

      var increaseProcessedCount = function() {
        processedCount++;
        if(processedCount === directoryChildren.length)
          self.emit('completed');
      };

      var handleError = function(err) {
        return self.emit('error', err);
      };

      fs.readdir(directory, onDirectoryRead);
    }
  };
  
  _.extend(DirectoryWalker.prototype, EventEmitter.prototype);
  
  var Builder = function(cfg, defaults) {
    EventEmitter.call(this);
    this.cfg = cfg;
    this.defaults = defaults;
    this.data = {};
    this.pending = 0;
    this.cfg.extraHandlers = this.cfg.extraHandlers || [];
  };
  
  Builder.prototype = {  
  
    run: function() {
      var root = new DirectoryWalker(this.cfg.in);
      var self = this;
      
      root.on('error', function(err) {
        self.emit('error', err);
      });
      
      root.on('completed', function() {
        self.writeOutput();
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
    
    processFile: function(path) {
      var self = this;
      this.pending++;
      this.findHandlerForFile(path, function(handler) {
        if(!handler) {
          self.pending--;
          return;
        }
        handler.handle(path, function(err, data) {
          if(err) { self.emit('error', err); return; }
          self.data[path] = data;
          self.pending--;         
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
          } else if(pendingHandlers === 0) {
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
  
  var handlers = {
    byExtension: function(extension, handler) {
      return {
        valid: function(filename, callback) {
          callback(filename.indexOf(extension) >= 0);
        },
        handle: handler
      }
    },
    text: function(filename, callback) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if(err) { callback(err); return; }
        callback(null, data);
      });
    },
    binary: function(filename, callback) {
      fs.readFile(filename, 'base64', function(err, data) {
        if(err) { callback(err); return; }
        callback(null, data);
      });
    },
    json: function(filename, callback) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if(err) { callback(err); return; }
        var obj = null;
        try {
          obj = JSON.parse(data);
        } catch (ex) {
          callback(ex, null);
          return;
        }        
        callback(null, obj);
      });
    }
  };
  
  return {
    build: function(cfg, cb) {
      var builder = new Builder(cfg, {
        handlers: [
          handlers.byExtension('.json', handlers.json),
          handlers.byExtension('.png', handlers.binary),
          handlers.byExtension('.wav', handlers.binary)     
        ]
      });
      builder.on('completed', function() {
        cb();
      });
      builder.on('error', function(err) {
        cb(err);
      });
      builder.on('file', function(file) {
       
      });
      builder.run();
    },
    handlers: handlers,
    Package: Package,
    DirectoryWalker: DirectoryWalker
  };

})();


var fs = require('fs');

var swallowTests = {
  packageDirectoryAndLoadPackage: function(cfg, cb) {
    swallow.build(cfg, function(err) {
      if(err) { cb(err); return; }
      fs.readFile(cfg.out, function(err, data) {
        if(err) { cb(err); return; }
        var obj = JSON.parse(data);
        var pkg = new swallow.Package(obj);
        cb(null, pkg);
      });
    });
  }
};

var handlers = swallow.handlers;


describe("Packaging a directory with default options", function() {
  var builtPackage = null;

  before(function(done) {
    swallowTests.packageDirectoryAndLoadPackage({
      in: './in/assets',
      out: './out/assets.json'
    }, 
    function(err, pkg) {
      if(err) throw err;
      builtPackage = pkg;
      done();
    })
  });
      
  it("should include .json files", function() {
  
  });
  
  it("should include .wav files", function() {
  
  });
  
  it("should include .png files", function() {
  
  });

  it("should ignore unknown files", function() {
  
  });
});

describe("Packaging a directory with an additional handler", function() {
  var builtPackage = null;
  
  before(function(done) {
    swallowTests.packageDirectoryAndLoadPackage({
    in: './in/assets',
    out: './out/assets.json',
    extraHandlers: [
      handlers.byExtension('.shader', handlers.text),
      handlers.byExtension('.fragment', handlers.text)
      ]
    }, 
    function(err, pkg) {
      if(err) throw err;
      builtPackage = pkg;
      done();
    });
  });

  it("should still execute default handlers", function() {
  
  });
  
  it("should execute the additional handler for appropriate files", function() {
  
  });

});
