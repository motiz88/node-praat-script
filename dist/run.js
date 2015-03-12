"use strict";
'use strict';
var runWith = require('./run-with');
module.exports = function run(script, cb) {
  runWith(require('praat'), script, cb);
};
//# sourceMappingURL=run.js.map
