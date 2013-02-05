var assert    = require('assert'),
    sinon     = require('sinon'),
    path      = require('path'),
    mockery   = require('mockery'),
    file_path = '../lib/lightning_strike';

describe('LightningStrike', function() {
  it('should return a middleware', function() {
    var LightningStrike = require(file_path),
        lightning       = new LightningStrike(),
        middleware      = lightning.middleware;
    assert.equal(typeof middleware, 'function');
  });

  describe('#isStaticPath', function() {
    var LightningStrike = require(file_path),
        lightning       = new LightningStrike();
    it('non static paths return false', function() {
      var result = lightning.isStaticPath('/blah/file.txt'); 
      assert.ok(!result);
    });

    it('static paths return true', function() {
      var result = lightning.isStaticPath('/static/file.txt'); 
      assert.ok(result);
    });
  });

  describe('#buildFilePath', function() {
    var LightningStrike = require(file_path),
        lightning       = new LightningStrike('/hello/files');

    it('returns the correct path', function() {
      var result = lightning.buildFilePath('/blah');
      assert.equal(result, '/hello/files/blah');
    }); 
  });

  it('should ignore non static paths', function() {
    var LightningStrike = require(file_path);
        lightning       = new LightningStrike(),
        middleware      = lightning.middleware,
        req             = { url: '/testing' },
        res             = sinon.stub(),
        next            = sinon.spy();

    middleware(req, res, next);
    assert.ok(next.called);
  });

  it('should ignore directories', function() {
    var fsMock = {
      stat: function(path, func) {
        var stats = {
          isDirectory: function() { return true; }
        }
        func(null, stats);
      }
    }
    var options = {
      mime: true,
      fs: fsMock
    }

    var LightningStrike = require(file_path);
        lightning       = new LightningStrike(path.join(__dirname, 'fixtures'), options),
        middleware      = lightning.middleware,
        req             = { url: '/static/test_dir' },
        res             = sinon.stub(),
        next            = sinon.spy();

    middleware(req, res, next);
    assert.ok(next.called);
  });

  it('render file out', function() {
    var stream           = { pipe: sinon.spy() },
        mimeMock         = { lookup: sinon.stub() },
        resMock          = { writeHead: sinon.spy() },
        reqMock          = { url: '/static/text.html' },
        createReadStream = sinon.stub(),
        next             = sinon.spy();

    var fsMock           = {
          createReadStream: createReadStream,
          stat: function(path, func) {
            var stats = { isDirectory: function() { return false; } }
            func(null, stats);
          }
        }

    mimeMock.lookup.returns('text/html');
    createReadStream.returns(stream);

    mockery.enable({ useCleanCache: true, warnOnUnregistered: false });
    mockery.registerMock('fs', fsMock);
    mockery.registerMock('mime', mimeMock);

    var LightningStrike = require(file_path);
        lightning       = new LightningStrike(path.join(__dirname, 'fixtures')),
        middleware      = lightning.middleware;

    middleware(reqMock, resMock, next);

    assert.ok(!next.called);
    assert.ok(resMock.writeHead.calledWith(200, { 'Content-Type': 'text/html' }));
    assert.ok(stream.pipe.calledWith(resMock));

    mockery.deregisterAll();
    mockery.disable();
  });
});
