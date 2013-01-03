var fs = require('fs'),
    mime = require('mime');

function FabricSoftener(starting_path) {
  this.starting_path = starting_path;
}

FabricSoftener.prototype.middleware = function() {
  var self = this;
  return function(req, res, next) {
    var path = self.starting_path + req.url;
    fs.exists(path, function(exists) {
      fs.stat(path, function(err, stats) {
        if (exists && !stats.isDirectory()) {
          res.writeHead(200, { 'Content-Type': mime.lookup(path) });
          var file = fs.createReadStream(path);
          file.pipe(res);
        } else {
          next();
        }
      });
    });
  }
}

module.exports = FabricSoftener;
