var gulp = require('gulp');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var cleanCSS = require('gulp-clean-css');

//var LessPluginCleanCSS = require('less-plugin-clean-css'),
    //cleancss = new LessPluginCleanCSS({advanced: true});

module.exports = function (gulp, plugins, path, minify) {
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
        
        .pipe(gulp.dest( dist ))
        .pipe(notify({ message: note }))

        .pipe(rename({suffix: '.min'}))
        //.pipe(changed( build_paths.css ))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest( dist ))
        .pipe(notify({ message: note }));
    };

    return less_task(path.src.less + '/*.less', path.dist.css, 'Build <%= file.relative %>' );

  };
};
