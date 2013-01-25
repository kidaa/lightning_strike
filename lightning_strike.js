var fs = require('fs');

function renderFile(res, path) {
  res.writeHead(200, { 'Content-Type': require('mime').lookup(path) });
  var file = fs.createReadStream(path);
  file.pipe(res);
}

function LightningStrike(starting_path, options) {
  options = options || {};
  this.starting_path = starting_path;
  this.prefix = options['prefix'] || "/static";
  this.matcher = new RegExp("^" + this.prefix);
}

LightningStrike.prototype.middleware = function() {
  var self = this;
  return function(req, res, next) {
    if (req.url.match(self.matcher)) {
      var sub_path = req.url.replace(self.prefix, ''),
          path = self.starting_path + sub_path;
      fs.stat(path, function(err, stats) {
        if (err) return;
        if (!stats.isDirectory()) {
          renderFile(res, path);
        } else {
          next();
        }
      });
    } else {
      next();
    }
  }
}

module.exports = LightningStrike;
