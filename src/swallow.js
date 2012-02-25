module.exports = (function(require) {

  var Builder = require('./builder');
  var handlers = require('./handlers');
  var Package = require('./package');
  var DirectoryWalker = require('./directorywalker');

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


}).call(this, require);
