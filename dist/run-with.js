"use strict";
'use strict';
var child_process = require('child_process');
var tmp = require('tmp');
var fs = require('fs');
module.exports = function runWith(praatExec, script, cb) {
  if (!cb)
    cb = function() {};
  var praat;
  var aborted = false;
  var controller = {abort: function() {
      if (!aborted) {
        if (praat) {
          praat.kill();
        }
      }
      aborted = true;
    }};
  try {
    if (aborted)
      throw new Error('Aborted by caller');
    tmp.file({keep: true}, function _tempFileCreated(err, path, fd) {
      try {
        var cleanupCallback = function() {
          try {
            fs.closeSync(fd);
          } catch (e) {}
          fs.unlink(path);
        };
        if (err)
          throw err;
        if (aborted)
          throw new Error('Aborted by caller');
        fs.write(fd, script.toString(), 0, 'utf8', function(err) {
          try {
            if (err)
              throw err;
            if (aborted)
              throw new Error('Aborted by caller');
            fs.close(fd, function(err) {
              try {
                if (err)
                  throw err;
                if (aborted)
                  throw new Error('Aborted by caller');
                var stdout = '';
                var stderr = '';
                praat = child_process.spawn(praatExec, [path], {stdio: ['ignore', 'ignore', 'ignore']});
                praat.on('close', function(err) {
                  praat = null;
                  try {
                    if (err)
                      throw err;
                    if (stderr && stderr.length > 0)
                      throw new Error(stderr.toString('utf8'));
                    if (aborted)
                      throw new Error('Aborted by caller');
                    cleanupCallback();
                    cb();
                  } catch (e) {
                    cleanupCallback();
                    cb(e);
                  }
                });
              } catch (e) {
                cleanupCallback();
                cb(e);
              }
            });
          } catch (e) {
            cleanupCallback();
            cb(e);
          }
        });
      } catch (e) {
        cleanupCallback();
        cb(e);
      }
    });
  } catch (e) {
    cb(e);
  }
  return controller;
};
//# sourceMappingURL=run-with.js.map
