var assert = require("assert");
var chai = require('chai');
chai.use(require('chai-as-promised'));

chai.should();
describe('praat-script module', function() {
    var praatScript = require('../src');

    describe('#formatArgument()', function() {
        it('should quote and escape string arguments', () => {
            assert.equal(`""`, praatScript.formatArgument(''));
            assert.equal(`"1"`, praatScript.formatArgument('1'));
            assert.equal(`"true"`, praatScript.formatArgument('true'));
        });
        it('should stringify numbers', () => {
            assert.equal('0', praatScript.formatArgument(0));
            assert.equal('0.5', praatScript.formatArgument(0.5));
            assert.equal('-0.5', praatScript.formatArgument(-0.5));
        });
        it('should convert booleans to 0 and 1', () => {
            assert.equal('0', praatScript.formatArgument(false));
            assert.equal('1', praatScript.formatArgument(true));
        });
    });

    describe('template string', function() {
        it('should escape arguments correctly via praatScript`...`', () => {
            assert.equal(`""`, praatScript `${''}`);
            assert.equal(`"1"`, praatScript `${'1'}`);
            assert.equal(`"true"`, praatScript `${'true'}`);

            assert.equal('0', praatScript `${(0)}`);
            assert.equal('0.5', praatScript `${(0.5)}`);
            assert.equal('-0.5', praatScript `${(-0.5)}`);

            assert.equal('0', praatScript `${(false)}`);
            assert.equal('1', praatScript `${(true)}`);
        });
        it('should not double-escape PraatScript instances`...`', () => {
            assert.equal('1', praatScript `${praatScript `${(true)}`}`);
        });
    });

    describe('#run()', function() {
        it('should run an empty script successfully', (done) => {
            praatScript.run('', done);
        });
        it('should run a simple script successfully', (done) => {
            praatScript.run(`
            	Create Sound as pure tone: "tone", 1, 0, 0.1, 44100, 440, 0.2, 0.01, 0.01
            	Praat test: "TimeRandomFraction", "5000000", "", "", ""
            `, done);
        });
        it('should run a template string script successfully', (done) => {
            var freq = 880;
            var name = "theTone";
            praatScript.run(praatScript `
            	Create Sound as pure tone: ${name}, 1, 0, 0.1, 44100, ${freq}, 0.2, 0.01, 0.01
            	Praat test: "TimeRandomFraction", "5000000", "", "", ""
            `, done);
        });
    });

    describe('#run() - Observable version', function() {
        it('should run an empty script successfully', () => {
            return praatScript.run('').toPromise();
        });
        it('should run a simple script successfully', () => {
            return praatScript.run(`
                Create Sound as pure tone: "tone", 1, 0, 0.1, 44100, 440, 0.2, 0.01, 0.01
                Praat test: "TimeRandomFraction", "5000000", "", "", ""
            `).toPromise();
        });
        it('should run a template string script successfully', () => {
            var freq = 880;
            var name = "theTone";
            return praatScript.run(praatScript `
                Create Sound as pure tone: ${name}, 1, 0, 0.1, 44100, ${freq}, 0.2, 0.01, 0.01
                Praat test: "TimeRandomFraction", "5000000", "", "", ""
            `).toPromise();
        });

        it('should support aborting via unsubscribe', (done) => {
            var script = praatScript `
                while 1
                endwhile
            `.run();
            var sub = script.subscribe(res => {
                done(new Error('No output should be produced by this script instance'));
            }, err => {
                done(err);
            }, () => {
                done(new Error('This script instance should terminate without notifying, since it was aborted'));
            });
            
            setTimeout(() => {
                sub.unsubscribe();
                setImmediate(() => done());
            }, 750);
        });        
    });
});

describe('template script source', function() {
    var praatScript = require('../src');

    describe('#run()', function() {
        it('should run an empty script successfully', (done) => {
            praatScript ``.run(done);
        });
        it('should run a simple script successfully', (done) => {
            praatScript `
            	Create Sound as pure tone: "tone", 1, 0, 0.1, 44100, 440, 0.2, 0.01, 0.01
            	Praat test: "TimeRandomFraction", "5000000", "", "", ""
            `.run(done);
        });
        it('should run a template string script successfully', (done) => {
            var freq = 880;
            var name = "theTone";
            praatScript `
            	Create Sound as pure tone: ${name}, 1, 0, 0.1, 44100, ${freq}, 0.2, 0.01, 0.01
            	Praat test: "TimeRandomFraction", "5000000", "", "", ""
            `.run(done);
        });
    });

    describe('#run() - Observable version', function() {
        it('should run an empty script successfully', () => {
            return praatScript ``.run().toPromise();
        });
        it('should run a simple script successfully', () => {
            return praatScript `
                Create Sound as pure tone: "tone", 1, 0, 0.1, 44100, 440, 0.2, 0.01, 0.01
                Praat test: "TimeRandomFraction", "5000000", "", "", ""
            `.run().toPromise();
        });
        it('should run a template string script successfully', () => {
            var freq = 880;
            var name = "theTone";
            return praatScript `
                Create Sound as pure tone: ${name}, 1, 0, 0.1, 44100, ${freq}, 0.2, 0.01, 0.01
                Praat test: "TimeRandomFraction", "5000000", "", "", ""
            `.run().toPromise();
        });
    });

});

describe('running script instance', function() {
    var praatScript = require('../src');

    describe('#abort()', function() {
        it('should abort an empty script successfully', (done) => {
            praatScript ``.run(err => {
                if (!err || (err instanceof Error && /abort/i.test(err.message)))
                    done();
                else
                    done(err);
            }).abort();
        });
        it('should abort a simple script successfully', (done) => {
            praatScript `
                Create Sound as pure tone: "tone", 1, 0, 0.1, 44100, 440, 0.2, 0.01, 0.01
                Praat test: "TimeRandomFraction", "5000000", "", "", ""
            `.run(err => {
                if (!err || (err instanceof Error && /abort/i.test(err.message)))
                    done();
                else
                    done(err);
            }).abort();
        });

        it('should delayed-abort a simple script successfully', (done) => {
            var script = praatScript `
                while 1
                endwhile
            `.run(err => {
                if (!err || (err instanceof Error && /abort/i.test(err.message)))
                    done();
                else
                    done(err);
            });
            setTimeout(() => script.abort(), 100);
        });

        it('should delayed-abort a simple script successfully with a long delay', (done) => {
            var script = praatScript `
                while 1
                endwhile
            `.run(err => {
                if (!err || (err instanceof Error && /abort/i.test(err.message)))
                    done();
                else
                    done(err);
            });
            setTimeout(() => script.abort(), 1000);
        });

    });

});