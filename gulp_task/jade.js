'use-strict';
var gulp = require('gulp');
var pug = require('gulp-pug');
var changed = require('gulp-changed');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');

module.exports = function (gulp, plugins, path) {
  return function () {
    var jade_task = function(src, dist, note){
      return gulp.src( src )
        .pipe(plumber(function (error) {
            gutil.log(error.message);
            this.emit('end');
        }))
        .pipe(
          pug({
            pretty: true
          })
        )
        .pipe(gulp.dest( dist ))
        .pipe(notify({
          message: note
        }));
    };

    return jade_task(path.src.jade + '**/*.jade', path.dist.html, 'Served Jade "<%= file.relative %>"!' );

  };
};
