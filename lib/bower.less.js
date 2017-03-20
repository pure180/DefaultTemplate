var es = require('event-stream');
var fs = require('fs');
var nodePath = require('path');
var _ = require("lodash");
var vfs = require('vinyl-fs');
var through = require('through2');

const PLUGIN_NAME = 'BowerLess';

var BowerLess = (function() {
  'use strict';

  function BowerLess( file, options ) {
    this.options         = _.merge( this.DEFAULTS, options );
    this.options.basedir = (options.basedir) ? nodePath.join( process.cwd(), options.basedir ) : this.options.basedir;
    this.file            = file;
    this.filename        = nodePath.basename( this.file.relative );
    this.pathToOriginal  = nodePath.join( this.file.base, 'variables.less' );
    this.dirOfCopy       = nodePath.join( this.options.basedir, 'variables' );
    this.pathToCopy      = nodePath.join( this.dirOfCopy, this.filename );
    this.contents        = this.replaceString();
    this.buffer          = new Buffer( this.contents );

    if ( this.options.makeCopy === true ) {

      this.copyVariables();
      //console.log(this.contents);
    }
  }

  BowerLess.prototype.DEFAULTS = {
    basedir:        process.cwd(),
    makeCopy:       true
  };

  BowerLess.prototype.replaceString = function() {
    var contents            = this.file.contents.toString('utf8'),
        relativePathToCopy  = nodePath.join( nodePath.relative( this.file.base, this.dirOfCopy ), this.filename );
    var newContent = contents.replace('variables.less', relativePathToCopy.replace(/\\/g, '/') );
    return newContent;

  };
  BowerLess.prototype.copyVariables = function() {

    if ( fs.existsSync( this.pathToOriginal ) ) {
      var contents = fs.readFileSync( this.pathToOriginal );
      if ( !fs.existsSync( this.dirOfCopy ) ) { fs.mkdirSync( this.dirOfCopy ); }

      if ( !fs.existsSync( this.pathToCopy ) ) {
        fs.writeFileSync( this.pathToCopy, contents );
      }
    }

  };

  BowerLess.prototype.stream = function () {
    var stream = through();
    stream.write( this.contents );
    return stream;
  };

  return BowerLess;
})();


module.exports = function(options) {
  return through.obj( function( file, enc, cb ) {
    if ( file.isNull() ) {
      // return an empty file
      return cb( null, file );
    }
    var bowerLess = new BowerLess(file, options);
    if ( file.isBuffer() ) {
      // Change contents when file is a Buffer
      file.contents = bowerLess.buffer;
    }
    if ( file.isStream() ) {
      // passs changed contents when file is a stream
      file.contents = file.contents.pipe( bowerLess.stream() );
    }
    cb(null, file);
  });
};
