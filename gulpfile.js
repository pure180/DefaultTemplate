'use-strict';

var gulp = require('gulp');
var del = require('del');
var plugins = require('gulp-load-plugins')();
var webserver = require('gulp-webserver');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var bower = require('bower');
var underscore = require('underscore');
var underscoreStr = require('underscore.string');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var mainBowerFiles = require('main-bower-files');
var path = require('./src.json');

var server = {
  port:             8888,
  open:             false,
  livereload:       true,
  directoryListing: false
};

/* -------------------------------------------------------------------------- *
 * Helper Functions
 * -------------------------------------------------------------------------- */

var copy = function (src, dist) {
  return gulp.src( src )
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(gulp.dest( dist ));
};


/* -------------------------------------------------------------------------- *
 * APLIKATION TASKS
 * -------------------------------------------------------------------------- */

gulp.task('jade', require('./gulp_task/jade')(gulp, plugins, path));
gulp.task('less:build', require('./gulp_task/less')(gulp, plugins, path, false));
gulp.task('less:build:min', require('./gulp_task/less')(gulp, plugins, path, true));
gulp.task('less', ['less:build', 'less:build:min']);
gulp.task('scripts', require('./gulp_task/scripts')(gulp, plugins, path));
gulp.task('images', require('./gulp_task/images')(gulp, plugins, path));
gulp.task('fonts', require('./gulp_task/fonts')(gulp, plugins, path));

gulp.task('reload', function() {
  gulp.src('./dist')
    .pipe(webserver({
      livereload: server.livereload,
      directoryListing: server.directoryListing,
      open: server.open,
      port: server.port
    }));
});

gulp.task('clean', function() {
    del([
      path.dist.html + '/**/*.html',
      path.dist.css + '/**/*.css',
      path.dist.js + '/**/*.js',
      path.dist.img + '/**/*.*',
      path.dist.fonts + '/**/*.*'
    ]);
});

gulp.task('watch', ['reload'], function() {
  gulp.watch( path.watch.jade, ['jade']);
  gulp.watch( path.watch.less, ['less']);
  gulp.watch( path.watch.js, ['scripts']);
  gulp.watch( path.watch.img, ['images']);
  gulp.watch( path.watch.fonts, ['fonts']);
});

gulp.task('build', ['jade', 'less', 'scripts', 'images', 'fonts']);


/* -------------------------------------------------------------------------- *
 * BOWER TASKS
 * -------------------------------------------------------------------------- */

gulp.task('bower:get', function(cb){
  bower.commands.install([], {save: true}, {})
    .on('end', function(installed){
      cb(); // notify gulp that this task is finished
    });
});

gulp.task('bower:js', function() {
  return gulp.src(mainBowerFiles('**/*.js'))
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(jshint( '.jshintrc'))
    .pipe(concat( 'libs.js' ))
    .pipe(gulp.dest( path.dist.js ))
    .pipe(notify({
      message: 'Build <%= file.relative %>'
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest( path.dist.js ))
    .pipe(notify({
      message: 'Build <%= file.relative %>'
    }));
});

/* Copy Bower Fonts */
gulp.task('bower:fonts', function() {
  return copy([path.bower + '/bootstrap/fonts/**/*.*', path.bower + '/fontawesome/fonts/**/*.*'], path.dist.fonts);
});

/* Copy Bower Less */
gulp.task('bower:less', function() {
  return copy(path.bower + '/bootstrap/less/**/*.less', path.src.less + '/bootstrap'),
    copy(path.bower + '/fontawesome/less/**/*.less', path.src.less + '/fontawesome');
});

/*  Bower general task */
gulp.task('bower', ['bower:get'], function(){
  gulp.start('bower:js', 'bower:less', 'bower:fonts');
});
