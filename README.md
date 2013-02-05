lightning_strike
===============

[![Build Status](https://travis-ci.org/bthesorceror/lightning_strike.png?branch=master)](https://travis-ci.org/bthesorceror/lightning_strike)

Journeyman middleware for serving static content

Blowing up your server with tons of static content
---------------------------------------------------

Example:

```javascript
var Journeyman      = require('journeyman');
var LightningStrike = require('lightning_strike');
var path            = require('path');

var server = new Journeyman(80);
var lightning = new LightningStrike(path.join(__dirname, 'test_dir'));

server.use(lightning.middleware);

server.listen();
```

Serves contents of 'test_dir' directory under the virtual directory 'static'.

```html
  <script type='text/javascript' src='/static/test.js'></script>
```
