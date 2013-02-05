class LightningStrike
  constructor: (starting_path, options = {}) ->
    @starting_path = starting_path
    @prefix        = options['prefix'] || '/static'
    @matcher       = new RegExp("^#{@prefix}")
    @mime          = options['mime'] || require('mime')
    @fs            = options['fs'] || require('fs')

  renderFile: (res, path) =>
    res.writeHead(200, { 'Content-Type': @mime.lookup(path) })
    file = @fs.createReadStream(path)
    file.pipe(res)

  isStaticPath: (url) =>
    url.match(@matcher)

  buildFilePath: (url) =>
    sub_path = url.replace(@prefix, '')
    @starting_path + sub_path

  handleFile: (path, res, next) =>
    return (err, stats) =>
      return if err
      if not stats.isDirectory()
        @renderFile(res, path)
      else
        next()

  middleware: (req, res, next) =>
    if @isStaticPath(req.url)
      path = @buildFilePath(req.url)
      @fs.stat(path, @handleFile(path, res, next))
    else
      next()

module.exports = LightningStrike
