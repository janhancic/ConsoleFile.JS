# ConsoleFile.JS

A library that allows you to log stuff into a log file in your browser (only Chrome for now, as no other browsers supports the FileSystem API ATM).

## Current status

The library is far from finished. This is just a proof of concept for now (that doesn't work very well).

It will however allow you to do stuff like this:

```javascript
console.file( 'my_log' ).log ( 'something' );
console.file().log ( 'something else' ); // uses 'default' for the name of the log file
console.file.log ( 'something different' ); // shortcut for the above
```

And whatever you log will get written to an actual log file on your disk.

## Developing
_this is more for me at the moment, so I don't forget how to start everything_

```
# start the watch command
grunt watch

# start the static server
grunt http-server
```
This will start a static server on `localhost:8080` and will rebuild `build/consolefile.js` each time a file inside `src/` changes.

## License

Licensed under MIT. See `LICENSE.md` file for details.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/janhancic/consolefile.js/trend.png)](https://bitdeli.com/free "Bitdeli Badge")