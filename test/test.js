var assert = require("assert")
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
            	Play
            `, done);
        });
        it('should run a template string script successfully', (done) => {
            var freq = 880;
            var name = "theTone";
            praatScript.run(praatScript `
            	Create Sound as pure tone: ${name}, 1, 0, 0.1, 44100, ${freq}, 0.2, 0.01, 0.01
            	Play
            `, done);
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
            	Play
            `.run(done);
        });
        it('should run a template string script successfully', (done) => {
            var freq = 880;
            var name = "theTone";
            praatScript `
            	Create Sound as pure tone: ${name}, 1, 0, 0.1, 44100, ${freq}, 0.2, 0.01, 0.01
            	Play
            `.run(done);
        });
    });

});

describe('running script instance', function() {
    var praatScript = require('../src');

    describe('#abort()', function() {
        it('should abort an empty script successfully', (done) => {
            praatScript ``.run(err => {
                assert((err instanceof Error) && /abort/i.test(err));
                done();
            }).abort();
        });
        it('should abort a simple script successfully', (done) => {
            praatScript `
                Create Sound as pure tone: "tone", 1, 0, 0.1, 44100, 440, 0.2, 0.01, 0.01
                Play
            `.run(err => {
                assert((err instanceof Error) && /abort/i.test(err));
                done();
            }).abort();
        });

        it('should delayed-abort a simple script successfully', (done) => {
            var script = praatScript `
                Create Sound as pure tone: "tone", 1, 0, 0.5, 44100, 440, 0.2, 0.01, 0.01
                Play
            `.run(err => {
                assert((err instanceof Error) && /abort/i.test(err));
                done();
            });
            setTimeout(() => script.abort(), 250);
        });

        it('should delayed-abort a simple script successfully with a long delay', (done) => {
            var script = praatScript `
                Create Sound as pure tone: "tone", 1, 0, 0.5, 44100, 440, 0.2, 0.01, 0.01
                Play
            `.run(done);
            setTimeout(() => script.abort(), 2500);
        });

    });

});