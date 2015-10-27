'use-strict';
var gulp = require('gulp');
var jade = require('gulp-jade');
var changed = require('gulp-changed'),
    cached = require('gulp-cached'),
    gulpif = require('gulp-if'),
    filter = require('gulp-filter'),
    webserver = require('gulp-webserver'),
    notify = require('gulp-notify');

var gutil = require('gulp-util');
var jadeInheritance = require('gulp-jade-inheritance');
var plumber = require('gulp-plumber');


module.exports = function (gulp, plugins, path) {
  return function () {
    var jade_task = function(src, dist, note){
      return gulp.src( src )
        .pipe(plumber(function (error) {
            gutil.log(error.message);
            this.emit('end');
        }))
        .pipe(changed(path.dist.html, {extension: '.html'}))
        .pipe(gulpif(global.isWatching, cached('jade')))
        .pipe(jadeInheritance({basedir: path.src.jade}))
        .pipe(filter(function (file) {
          return !/\/_/.test(file.path) || !/^_/.test(file.relative);
        }))
        .pipe(jade({
          pretty: true
        }))
        .pipe(gulp.dest( dist ))
        .pipe(notify({
          message: note
        }));
    };

    return jade_task(path.src.jade + '**/*.jade', path.dist.html, 'Served Jade "<%= file.relative %>"!' );

  };
};
