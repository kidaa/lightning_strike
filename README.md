lightning_strike
===============

Journeyman middleware for serving static content

Example:
----------------

```javascript
var Journeyman      = require('journeyman');
var LightningStrike = require('lightning_strike');
var path            = require('path');

var server = new Journeyman();
var lightning = new LightningStrike(path.join(__dirname, 'test_dir'));

server.use(lightning.middleware());

server.listen(80);
```

will server up contents of 'test_dir' directory under the virtual directory 'static'

```html
  <script type='text/javascript' src='/static/test.js'></script>
```
