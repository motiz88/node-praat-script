'use strict';

var formatArgument = require('./format-argument');
var run = require('./run');
var runWith = require('./run-with');

var util = require('util');

var PraatScript = function PraatScript(script) {
    if (!this)
        return new PraatScript(script);
    this._script = script;
};

PraatScript.prototype.toString = function() {
    return this._script;
};

PraatScript.prototype.run = function(cb) {
    return run(this, cb);
};

PraatScript.prototype.runWith = function(praatExec, cb) {
    return runWith(this, praatExec, cb);
};

module.exports = function PraatScriptTemplate(literals, ...substitutions) {
    var result = "";

    // run the loop only for the substitution count
    for (var i = 0; i < substitutions.length; i++) {
        result += literals[i];
        result += formatArgument(substitutions[i]);
    }

    // add the last literal
    result += literals[literals.length - 1];

    return PraatScript(result);
};