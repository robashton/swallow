module.exports = (function(require) {
  var fs = require('fs');

  return {
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
}).call(this, require);

