var gulp = require('gulp');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var gulpif = require('gulp-if');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var cleanCSS = require('gulp-clean-css');

module.exports = function (gulp, plugins, path, minify) {
  var min;
  if(minify){
    min = true;
  } else {
    min = false;
  }
  return function () {
    var less_task = function(src, dist, note){
      return gulp.src( src )
        .pipe(plumber(function (error) {
            gutil.log(error.message);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({
              browsers: [
                "Android 2.3",
                "Android 4",
                "Android >= 4",
                "Chrome >= 20",
                "ChromeAndroid >= 20",
                "Firefox >= 24",
                "Explorer >= 8",
                "iOS >= 6",
                "Opera >= 12",
                "Safari >= 6"
              ],
              cascade: true
        }))
        .pipe(gulpif( min, rename({suffix: '.min'}) ))
        .pipe(gulpif( min, cleanCSS({compatibility: 'ie8'}) ))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest( dist ))
        .pipe(notify({ message: note }));
    };

    return less_task(path.src.less + '/*.less', path.dist.css, 'Build <%= file.relative %>' );

  };
};
