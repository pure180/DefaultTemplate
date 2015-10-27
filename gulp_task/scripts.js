var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var gutil = require('gulp-util');

var LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new LessPluginCleanCSS({advanced: true});

module.exports = function (gulp, plugins, path) {
  return function () {
    var scripts_task = function(src, dist, note){
    return gulp.src( src )
      .pipe(plumber(function (error) {
          gutil.log(error.message);
          this.emit('end');
      }))
      .pipe(jshint('.jshintrc'))
      //.pipe(jshint.reporter('default', { verbose: true }))
      .pipe(concat('main.js'))
      .pipe(gulp.dest( dist ))
      .pipe(notify({
        message: 'Served "./build/js/<%= file.relative %>"!'
      }))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest( dist ))
      .pipe(notify({ message:
        'Served "./build/js/<%= file.relative %>"!'
      }));
    };

    return scripts_task(path.src.js + '**/*.js', path.dist.js, 'Served "./build/js/<%= file.relative %>"!' );

  };
};
