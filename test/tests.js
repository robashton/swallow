var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var path = require('path');
var assert = require('assert');

var swallow = (function() {

  var Package = function(data) {
    this.data = data;
  };
  
  Package.prototype = {
    getRaw: function(path) {
      return this.data[path] || null;
    }
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
    this.completed = false;
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
        self.completed = true;
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
          handlers.byExtension('.wav', handlers.binary),
          handlers.byExtension('.jpg', handlers.binary)
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

var IntegrityChecks = {
  Json: function(pkg, path, done) {
    var packageJson = pkg.getRaw(path);
    var packageString = JSON.stringify(packageJson);
    fs.readFile(path, function(err, fileData) {
      var fileString = JSON.stringify(JSON.parse(fileData));
      assert(packageString, "Contents don't exist in package");
      assert(packageString === fileString, "Contents are not equal")
      done();
    });
  },
  Binary: function(pkg, path, done) {
    var packageString = pkg.getRaw(path);
    fs.readFile(path, 'base64', function(err, fileString) {
      assert(packageString, "Contents don't exist in package");
      assert(packageString === fileString, "Contents are not equal");
      done();
    });
  },
  Text: function(pkg, path, done) {
    var packageString = pkg.getRaw(path);
    fs.readFile(path, 'utf8', function(err, fileString) {
      assert(packageString, "Contents don't exist in package");
      assert(packageString === fileString, "Contents are not equal");
      done();
    });
  }
};


describe("Packaging a directory with default options", function() {
  var builtPackage = null;

  before(function(done) {
    swallowTests.packageDirectoryAndLoadPackage({
      in: './in/assets',
      out: './out/packing_directory_default_options.json'
    }, 
    function(err, pkg) {
      if(err) throw err;
      builtPackage = pkg;
      done();
    })
  });
      
  it("should package .json files", function(done) {
    IntegrityChecks.Json(builtPackage, 'in/assets/models/hovercraft.json', done);
  });
  
  it("should package .wav files", function(done) {
    IntegrityChecks.Binary(builtPackage, 'in/assets/sounds/pigeon.wav', done);
  });
  
  it("should package .jpg files", function(done) {
    IntegrityChecks.Binary(builtPackage, 'in/assets/textures/bars.jpg', done);
  });
  
  it("should package .png files", function(done) {
    IntegrityChecks.Binary(builtPackage, 'in/assets/textures/pigeon.png', done);
  });

  it("should ignore unknown files", function() {
    var rawData = builtPackage.getRaw('in/assets/shaders/colour.fragment');
    assert(rawData === null);
  });
});


describe("Packaging a directory with an additional handler", function() {
  var builtPackage = null;
  
  before(function(done) {
    swallowTests.packageDirectoryAndLoadPackage({
    in: './in/assets',
    out: './out/packing_directory_additional_handler.json',
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

  it("should still execute default handlers", function(done) {
    IntegrityChecks.Json(builtPackage, 'in/assets/models/hovercraft.json', function() {
       IntegrityChecks.Binary(builtPackage, 'in/assets/textures/pigeon.png', done);    
    });
  });
  
  it("should execute the additional handler for appropriate files", function(done) {
   IntegrityChecks.Text(builtPackage, 'in/assets/shaders/colour.fragment', function() {
    IntegrityChecks.Text(builtPackage, 'in/assets/shaders/colour.shader', done);
   });
  });

});
