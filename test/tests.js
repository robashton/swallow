var assert = require('assert');
var swallow = require('../src/swallow');
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
      if(err) throw err;
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

describe("Packaging a directory with a root specified", function() {
  var builtPackage = null;

  before(function(done) {
    swallowTests.packageDirectoryAndLoadPackage({
      in: './assets',
      out: './out/packaging_directory_with_root_specified.json',
      root: 'in'
    },
    function(err, pkg) {
      if(err) throw err;
      builtPackage = pkg;
      done();
    });
  });

  it("Should remove the root from the path", function() {
    var packageJson = builtPackage.getRaw('assets/models/hovercraft.json');
    assert(packageJson);    
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
