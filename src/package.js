module.exports = (function(require) {

  var Package = function(data) {
    this.data = data;
  };

  Package.prototype = {
    getRaw: function(path) {
      return this.data[path] || null;
    }
  };
  
  return Package;

}).call(this, require);


