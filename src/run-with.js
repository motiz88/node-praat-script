'use strict';

var child_process = require('child_process');
var tmp = require('tmp');
var fs = require('fs');

module.exports = function runWith(praatExec, script, cb) {
    if (!cb)
        cb = function() {};
    tmp.file({
            keep: true
        },
        function _tempFileCreated(err, path, fd) {
            try {
                var cleanupCallback = function() {
                    try {
                        fs.closeSync(fd);
                    } catch (e) {}
                    fs.unlink(path);
                };
                if (err) throw err;
                fs.write(fd, script.toString(), 0, 'utf8', function(err) {
                    try {
                        if (err) throw err;
                        fs.close(fd, function(err) {
                            try {
                                if (err) throw err;
                                var stdout = '';
                                var stderr = '';
                                var praat = child_process.spawn(praatExec, [path], {
                                    stdio: ['ignore', 'ignore', 'ignore']
                                });
                                praat.on('close', function(err) {
                                    try {
                                        if (err) throw err;
                                        if (stderr && stderr.length > 0)
                                            throw new Error(stderr.toString('utf8'));
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

                // If we don't need the file anymore we could manually call the cleanupCallback 
                // But that is not necessary if we didn't pass the keep option because the library 
                // will clean after itself. 
            } catch (e) {
                cleanupCallback();
                cb(e);
            }
        });
};