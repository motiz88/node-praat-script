'use strict';

require('traceur-runtime');

module.exports = require('./praat-script');
module.exports.formatArgument = require('./format-argument');
module.exports.runWith = require('./run-with');
module.exports.run = require('./run');