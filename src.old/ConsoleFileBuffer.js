function ConsoleFileBuffer ( fileWriter ) {
	ConsoleFileBase.call( this, file );

	this._buffer = {
		'log': []
	};
}
ConsoleFileBuffer.prototype = new ConsoleFileBase();
ConsoleFileBuffer.prototype.constructor = ConsoleFileBuffer;

ConsoleFileBuffer.prototype.getBuffer = function () {
	return this._buffer;
};

ConsoleFileBuffer.prototype.log = function () {
	var buffer = [];
	buffer.push( Array.prototype.slice.call( arguments ) );

	this._buffer.log.push( buffer );
};