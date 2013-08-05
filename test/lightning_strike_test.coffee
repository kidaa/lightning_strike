assert    = require('assert')
sinon     = require('sinon')
path      = require('path')
file_path = '../index'

describe 'LightningStrike', () ->
  it 'should return a middleware', () ->
    LightningStrike = require(file_path)
    lightning       = new LightningStrike()
    middleware      = lightning.middleware
    assert.equal(typeof middleware, 'function')

  describe '#isStaticPath', () ->
    LightningStrike = require(file_path)
    lightning       = new LightningStrike()

    it 'non static paths return false', () ->
      result = lightning.isStaticPath('/blah/file.txt')
      assert.ok(!result)

    it 'static paths return true', () ->
      result = lightning.isStaticPath('/static/file.txt')
      assert.ok(result)

  describe '#buildFilePath', () ->
    LightningStrike = require(file_path)
    lightning       = new LightningStrike('/hello/files')

    it 'returns the correct path', () ->
      result = lightning.buildFilePath('/blah')
      assert.equal(result, '/hello/files/blah')

  it 'should ignore non static paths', () ->
    LightningStrike = require(file_path)
    lightning       = new LightningStrike()
    middleware      = lightning.middleware()
    req             = { url: '/testing' }
    res             = sinon.stub()
    next            = sinon.spy()

    middleware(req, res, next)
    assert.ok(next.called)

  it 'should ignore directories', () ->
    fsMock =
      stat: (path, func) ->
        stats =
          isDirectory: () ->
            true
        func(null, stats)

    options =
      mime: true
      fs: fsMock

    LightningStrike = require(file_path)
    dir_path       = path.join(__dirname, 'fixtures')
    lightning       = new LightningStrike(dir_path, options)
    middleware      = lightning.middleware()
    req             = { url: '/static/test_dir' }
    res             = sinon.stub()
    next            = sinon.spy()

    middleware(req, res, next)
    assert.ok(next.called)

  it 'render file out', () ->
    stream           = { pipe: sinon.spy() }
    mimeMock         = { lookup: sinon.stub() }
    resMock          = { writeHead: sinon.spy() }
    reqMock          = { url: '/static/text.html' }
    createReadStream = sinon.stub()
    next             = sinon.spy()

    fsMock =
      createReadStream: createReadStream
      stat: (path, func) ->
        stats =
          isDirectory: () ->
            return false
        func(null, stats)

    mimeMock.lookup.returns('text/html')
    createReadStream.returns(stream)

    options =
      fs: fsMock
      mime: mimeMock

    LightningStrike = require(file_path)
    lightning       = new LightningStrike('..', options)
    middleware      = lightning.middleware()

    middleware(reqMock, resMock, next)

    assert.ok(!next.called)
    assert.ok(resMock.writeHead.calledWith(200, { 'Content-Type': 'text/html' }))
    assert.ok(stream.pipe.calledWith(resMock))
