function ConsoleFileBase ( fileWriter ) {
	this._fileWriter = fileWriter;

	this._writeOptions = {
		logTime: true,
		stringifyObjects: true
	};
}

/**
 * Sets new options for how the log is written.
 * Available options:
 * 	- `logTime`: (boolean) add time to the each log line
 * 	- `stringifyObjects`: (boolean) if `true` non-primitive 
 * 	 values will be passed trough `JSON.stringify()` before 
 * 	 being written to the log.
 * @param {String} key Option name
 * @param {String} value Option value
 */
ConsoleFileBase.prototype.setSetting = function ( key, value ) {
	this._writeOptions[key] = value;
};

ConsoleFileBase.prototype.log = function () {
};

ConsoleFileBase.prototype.info = function () {
};

ConsoleFileBase.prototype.warn = function () {
};

ConsoleFileBase.prototype.error = function () {
};