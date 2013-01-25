var assert    = require('assert'),
    sinon     = require('sinon'),
    path      = require('path'),
    mockery   = require('mockery'),
    file_path = '../lightning_strike';

describe('LightningStrike', function() {
  it('should return a middleware', function() {
    var LightningStrike = require(file_path),
        lightning       = new LightningStrike(),
        middleware      = lightning.middleware();
    assert.equal(typeof middleware, 'function');
  });

  it('should ignore non static paths', function() {
    var LightningStrike = require(file_path);
        lightning       = new LightningStrike(),
        middleware      = lightning.middleware(),
        req             = { url: '/testing' },
        res             = sinon.stub(),
        next            = sinon.spy();

    middleware(req, res, next);
    assert.ok(next.called);
  });

  it('should ignore directories', function() {
    fsMock = {
      stat: function(path, func) {
        var stats = {
          isDirectory: function() { return true; }
        }
        func(null, stats);
      }
    }

    mockery.enable({ useCleanCache: true, warnOnUnregistered: false });
    mockery.registerMock('fs', fsMock);

    var LightningStrike = require(file_path);
        lightning       = new LightningStrike(path.join(__dirname, 'fixtures')),
        middleware      = lightning.middleware(),
        req             = { url: '/static/test_dir' },
        res             = sinon.stub(),
        next            = sinon.spy();

    middleware(req, res, next);
    assert.ok(next.called);

    mockery.deregisterAll();
    mockery.disable();
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
        middleware      = lightning.middleware();

    middleware(req, resMock, next);

    assert.ok(!next.called);
    assert.ok(resMock.writeHead.calledWith(200, { 'Content-Type': 'text/html' }));
    assert.ok(stream.pipe.calledWith(resMock));

    mockery.deregisterAll();
    mockery.disable();
  });
});
