'use strict';

require('traceur-runtime');

var child_process = require('child_process');
var tmp = require('tmp');
var fs = require('fs');
var Observable = require('rxjs').Observable;

function castError(err) {
	if (err instanceof Error)
		return err;
	return new Error('Error ' + err);
}

module.exports = function runWith(praatExec, script, cb) {
	if (typeof cb === 'function')
		return runWithCallback(praatExec, script, cb);
	else
		return new Observable(observer => {
			var controller = runWithCallback(praatExec, script, (err, res) => {
				if (err)
					observer.error(err);
				else {
					observer.next(res);
					observer.complete();
				}
			});
			return controller.abort;
		}).share();
};

function runWithCallback(praatExec, script, cb) {
	if (!cb)
		cb = function() {};
	var praat;
	var aborted = false;
	var controller = {
		abort: function() {

			if (!aborted) {
				if (praat) {
					praat.kill();
				}
			}

			aborted = true;
		}
	};
	try {
		if (aborted)
			throw new Error('Aborted by caller');
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
					if (err) throw castError(err);
					if (aborted)
						throw new Error('Aborted by caller');
					fs.write(fd, script.toString(), 0, 'utf8', function(err) {
						try {
							if (err) throw castError(err);
							if (aborted)
								throw new Error('Aborted by caller');
							fs.close(fd, function(err) {
								try {
									if (err) throw castError(err);
									if (aborted)
										throw new Error('Aborted by caller');
									var stdout = '';
									var stderr = '';
									praat = child_process.spawn(praatExec, ['--run', path], {
										stdio: ['ignore', 'ignore', 'ignore']
									});
									praat.on('close', function(err) {
										praat = null;
										try {
											if (err) throw castError(err);
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

					// If we don't need the file anymore we could manually call the cleanupCallback 
					// But that is not necessary if we didn't pass the keep option because the library 
					// will clean after itself. 
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