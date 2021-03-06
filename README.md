# praat-script 

Generate and run [Praat](http://www.fon.hum.uva.nl/praat) scripts from Node.js.

## Installation

Download node at [nodejs.org](http://nodejs.org) and install it, if you haven't already.

```sh
npm install praat-script --save
```

To actually run scripts, you will need Praat. [node-praat](https://github.com/motiz88/node-praat) (`npm install praat`) is one easy way to install it in a Node application. `praat` is an optional dependency of `praat-script` and is required for the `.run()` convenience method to function correctly.

## Usage

### Creating and running scripts

To demonstrate `praat-script`, we'll use a simple script that generates a Sound object, plays it and exits.

```node
var praatScript = require('praat-script');
praatScript([
  'Create Sound as pure tone: "tone", 1, 0, 0.1, 44100, 440, 0.2, 0.01, 0.01' + '\r\n' +
  'Play'
]).run(function(err) {
    if (err)
        throw err;
    console.log('Success!');
});
```

But this module really shines when used along with ES6 [tagged template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings#Tagged_template_strings). 

Since template strings are multi-line, the ES6 version of our static script is already nicer to look at:
(Run with a JavaScript engine that supports ES6 template strings, or use a transpiler like [Traceur](https://github.com/google/traceur-compiler).)

```node
praatScript`
  Create Sound as pure tone: "tone", 1, 0, 0.1, 44100, 440, 0.2, 0.01, 0.01
  Play
` //.run(...);
```

And now we can even embed JavaScript expressions directly in our Praat code! `praat-script` quotes and escapes everything correctly.

```node
var freq = 440;
var name = "theTone";
praatScript`
  Create Sound as pure tone: ${name}, 1, 0, 0.1, 44100, ${freq * 2}, 0.2, 0.01, 0.01
  Play
` //.run(...);
```

Of course, since template strings are merely syntactic sugar, you can technically also do the same in ES5, though it won't be as readable:

```node
praatScript(
    [
        'Create Sound as pure tone: ',
        /* name will go here */ ', 1, 0, 0.1, 44100, ',
        /* freq*2 will go here */ ', 0.2, 0.01, 0.01' + '\r\n' +
        'Play'
    ],
    name, freq*2
) //.run(...);
```
### Miscellaneous functions

### Getting the text of a script
`` praatScript`...` .toString()`` or `praatScript([...]).toString()` works as you'd expect.

### Specifying the path to Praat
Using `.runWith('path/to/praat', callback)` instead of `.run(callback)` will use the specified Praat executable instead of the default (which is the path returned by `require('praat')`).

#### `.formatArgument(value)`
`praatScript.formatArgument(value)` takes a JavaScript value and returns a string formatted for use in Praat.

#### `.run(script, cb)` (and `.runWith(pathToPraat, script, cb)`)
You can bypass the template functionality entirely and execute a script by passing its source code as `praatScript.run()`'s first argument (a string). This otherwise works similarly to calling  `.run()` on the template string instance.

## Tests

```sh
npm install
npm test
```
```

> praat-script@0.1.1 test node-praat-script
> mocha
  praat-script module
    #formatArgument()
      √ should quote and escape string arguments 
      √ should stringify numbers 
      √ should convert booleans to 0 and 1 
    template string
      √ should escape arguments correctly via praatScript`...` 
    #run()
      √ should run an empty script successfully (118ms)
      √ should run a simple script successfully (872ms)
      √ should run a template string script successfully (1052ms)
  template script instance
    #run()
      √ should run an empty script successfully (82ms)
      √ should run a simple script successfully (950ms)
      √ should run a template string script successfully (897ms)
  10 passing (4s)

```

## Dependencies

- [tmp](https://github.com/raszi/node-tmp): Temporary file and directory creator

## Optional Dependencies

- [praat](https://github.com/motiz88/node-praat): A cross-platform NPM installer for Praat (_required to use `.run()`_)

## Dev Dependencies

- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mocha-traceur](https://github.com/domenic/mocha-traceur): A &quot;compiler&quot; plugin for Mocha that makes non-dependency JS files to pass through Traceur
- [traceur](https://github.com/google/traceur-compiler): ES6 to ES5 compiler


## License

MIT

_Generated by [package-json-to-readme](https://github.com/zeke/package-json-to-readme)_
