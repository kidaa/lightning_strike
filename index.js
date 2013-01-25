var fs = require('fs'),
    mime = require('mime');

function FabricSoftener(starting_path, options) {
  options = options || {};
  this.starting_path = starting_path;
  this.prefix = options['prefix'] || "/static";
  this.matcher = new RegExp("^" + this.prefix);
}

function renderFile(res, path) {
  res.writeHead(200, { 'Content-Type': mime.lookup(path) });
  var file = fs.createReadStream(path);
  file.pipe(res);
}

FabricSoftener.prototype.middleware = function() {
  var self = this;
  return function(req, res, next) {
    if (req.url.match(self.matcher)) {
      var sub_path = req.url.replace(self.prefix, ''),
          path = self.starting_path + sub_path;
      fs.stat(path, function(err, stats) {
        if (!stats.isDirectory()) {
          renderFile(res, path);
        }
      });
    } else {
      next();
    }
  }
}

module.exports = FabricSoftener;
