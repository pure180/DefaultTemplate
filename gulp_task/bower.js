'use-strict';
var gulp = require('gulp');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var bower = require('bower');
var  underscore = require('underscore');
var underscoreStr = require('underscore.string');
var gutil = require('gulp-util');


var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');


module.exports = function (gulp, plugins, path, extension) {
  return function () {

    var bowerFile = require('../bower.json');
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
        underscore.each(main, function(file){
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

};
