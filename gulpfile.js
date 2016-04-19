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
var path = require('./src.json');

var server = {
  port:             8888,
  open:             false,
  livereload:       true,
  directoryListing: false
};

/* -------------------------------------------------------------------------- *
 * APLIKATION TASKS
 * -------------------------------------------------------------------------- */

gulp.task('jade', require('./gulp_task/jade')(gulp, plugins, path));
gulp.task('less', require('./gulp_task/less')(gulp, plugins, path));
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

/* -------------------------------------------------------------------------- *
 * BOWER TASKS
 * -------------------------------------------------------------------------- */

gulp.task('bower', function(cb){
  bower.commands.install([], {save: true}, {})
    .on('end', function(installed){
      cb(); // notify gulp that this task is finished
    });
});

var bundle_bower_libraries = function(path, extension) {
  var bowerFile = require('./bower.json');
  var bowerPackages = bowerFile.dependencies;
  var bowerDir = path.bower;
  var packagesOrder = [];
  var exclude = [];
  var mainFiles = [];

  // Function for adding package name into packagesOrder array in the right order
  function addPackage(name){
    // package info and dependencies
    var info = require(bowerDir + '/' + name + '/bower.json');
    var dependencies = info.dependencies;

    // add dependencies by repeat the step
    if(!!dependencies){
      underscore.each(dependencies, function(value, key){
        if(exclude.indexOf(key) === -1){
          addPackage(key);
        }
      });
    }

    // and then add this package into the packagesOrder array if they are not exist yet
    if(packagesOrder.indexOf(name) === -1){
      packagesOrder.push(name);
    }
  }

  // calculate the order of packages
  underscore.each(bowerPackages, function(value, key){
    if(exclude.indexOf(key) === -1){ // add to packagesOrder if it's not in exclude
      addPackage(key);
    }
  });

  // get the main files of packages base on the order
  underscore.each(packagesOrder, function(bowerPackage){
    var info = require(bowerDir + '/' + bowerPackage + '/bower.json');
    var main = info.main;
    var mainFile = main;

    // get only the .js file if mainFile is an array
    if(underscore.isArray(main)){
      underscore.each(main, function(file, extension){
        if(underscoreStr.endsWith(file, extension)){
          mainFile = file;
        }
      });
    }

    // make the full path
    mainFile = bowerDir + '/' + bowerPackage + '/' + mainFile;

    // only add the main file if it's a js file
    if(underscoreStr.endsWith(mainFile, extension)){
      mainFiles.push(mainFile);
    }
  });

  // run the gulp stream
  return gulp.src(mainFiles)
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(jshint('.jshintrc'))
    //.pipe(jshint.reporter('default', { verbose: true }))
    .pipe(concat('libs.js'))
    .pipe(gulp.dest( path.dist.js ))
    .pipe(notify({
      message: 'Served "./build/js/<%= file.relative %>"!'
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest( path.dist.js ))
    .pipe(notify({ message:
      'Served "./build/js/<%= file.relative %>"!'
    }));

};

gulp.task('bower-js-libs', function(){
  return bundle_bower_libraries(path, '.js');
});

gulp.task('bower-less', function(){
  var bootstrap_less_files = gulp.src( path.bower + '/bootstrap/less/**/*')
    .pipe(gulp.dest( path.src.less + '/bootstrap' ));

  var fontawesome_less_files = gulp.src( path.bower + '/fontawesome/less/**/*')
    .pipe(gulp.dest( path.src.less + '/font-awesome' ));

  return bootstrap_less_files, fontawesome_less_files;

});

gulp.task('bower-fonts', function(){
  var bootstrap_font_files = gulp.src( path.bower + '/bootstrap/fonts/**/*')
    .pipe(gulp.dest( path.dist.fonts ));

  var fontawesome_font_files = gulp.src( path.bower + '/fontawesome/fonts/**/*')
    .pipe(gulp.dest( path.dist.fonts));

  return bootstrap_font_files, fontawesome_font_files;
});

/* -------------------------------------------------------------------------- *
 * GULP TASKS
 * -------------------------------------------------------------------------- */

gulp.task('watch', ['reload'], function() {
  gulp.watch( path.watch.jade, ['jade']);
  gulp.watch( path.watch.less, ['less']);
  gulp.watch( path.watch.js, ['scripts']);
  gulp.watch( path.watch.img, ['images']);
  gulp.watch( path.watch.fonts, ['fonts']);
});

gulp.task('build', ['jade', 'less', 'scripts', 'images', 'fonts']);

gulp.task('bower-update', ['bower'], function(cb) {
    runSequence(['bower-js-libs', 'bower-less', 'bower-fonts'], cb);
});

gulp.task('create', ['clean', 'bower-update'], function(cb) {
  runSequence('build', cb);
});

gulp.task('start', ['clean', 'build', 'watch', 'bower-update']);
