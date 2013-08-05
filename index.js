var path = require('path');

function LightningStrike(starting_path, options) {
  options = options || {};
  this.starting_path = starting_path;
  this.prefix = options['prefix'] || '/static';
  this.matcher = new RegExp('^' + this.prefix);
  this.mime = options['mime'] || require('mime');
  this.fs = options['fs'] || require('fs');
}

LightningStrike.prototype.renderFile = function(res, path) {
  res.writeHead(200, { 'Content-Type': this.mime.lookup(path) })
  file = this.fs.createReadStream(path);
  file.pipe(res);
}

LightningStrike.prototype.isStaticPath = function(url) {
  return url.match(this.matcher);
}

LightningStrike.prototype.buildFilePath = function(url) {
  sub_path = url.replace(this.prefix, '');
  return path.join(this.starting_path, sub_path);
}

LightningStrike.prototype.handleFile = function(path, res, next) {
  var self = this;
  return function(err, stats) {
    if (err) return;
    if (!stats.isDirectory())
      self.renderFile(res, path);
    else
      next();
  }
}

LightningStrike.prototype.middleware = function() {
  var self = this;
  return function(req, res, next) {
    if (self.isStaticPath(req.url)) {
      var path = self.buildFilePath(req.url);
      self.fs.stat(path, self.handleFile(path, res, next));
    } else {
      next();
    }
  }
}

module.exports = LightningStrike;
