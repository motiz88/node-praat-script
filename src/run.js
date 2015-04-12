'use strict';
var runWith = require('./run-with');
module.exports = function run(script, cb) {
	return runWith(require('praat'), script, cb);
};