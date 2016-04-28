'use-strict';
var gulp = require('gulp');
var changed = require('gulp-changed');
var notify = require('gulp-notify');

module.exports = function (gulp, plugins, path) {
  return function () {
    var fonts_task = function(src, dist, note){
      gulp.src( src + '**/*.*')
        .pipe(changed( dist ))
        .pipe(gulp.dest( dist ))
        .pipe(notify({
          message: 'Copied "./build/fonts/<%= file.relative %>"'
        }));
    };

    return fonts_task(path.src.fonts, path.dist.fonts, 'Copied "./build/fonts/<%= file.relative %>"' );

  };
};
