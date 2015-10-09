'use strict';

var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    jade = require('gulp-jade'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    webserver = require('gulp-webserver'),
    changed = require('gulp-changed'),
    del = require('del');

var gutil = require('gulp-util');
var plumber = require('gulp-plumber');



// Paths for the App inviroment
var root = {
  src: 'src/',
  build: 'public/',
  bower_components: './src/bower_components'
};

// Paths to the Sourcefiles
var src_paths = {
  images: root.src + 'images/**/*',
  less: root.src + 'less',
  scripts: root.src + 'scripts',
  jade: root.src + 'jade',
  fonts: root.src + 'fonts/**/*'
};

//Build Path
var build_paths = {
  fonts: root.build + 'fonts',
  css: root.build + 'css',
  js: root.build + 'js',
  img: root.build + 'img'
};

var files = {
    // JS Files
    js_libs :           'libs.js',
    js_scroller:        'apps/jquery.dpscroller.js',
    js_triggerresize:   'apps/jquery.triggerresize.js',
    js_plugins:         'plugins.js',
    js_main:            'main.js',


    // Less Files
    less_libs: 'libs.less',
    less_index: 'index.less'
};

var config = {
  server: {
    port: 8000,
    open: false,
    livereload: true
  },
};


gulp.task('jade', function () {
  return gulp.src( src_paths.jade + '/Templates/**/*.jade' )
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(changed( root.build ))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(root.build))
    .pipe(notify({
      message: 'Served Jade "<%= file.relative %>"!'
    }));
});


// Compile LESS to CSS minify, autoprefix and copy to ./public/css/

var LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new LessPluginCleanCSS({advanced: true});

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix= new LessPluginAutoPrefix({browsers: ['last 2 versions']});


gulp.task('styles', function() {
  return gulp.src([
      src_paths.less + '/' + files.less_libs,
      src_paths.less + '/' + files.less_index,
      src_paths.less + '/' + files.less_medias
    ])
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
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
    .pipe(gulp.dest( build_paths.css ))
    .pipe(notify({ message: 'Build <%= file.relative %>' }))
    .pipe(rename({suffix: '.min'}))
    //.pipe(changed( build_paths.css ))
    .pipe(less({
        plugins: [cleancss]
    }))
    .pipe(gulp.dest( build_paths.css ))
    .pipe(notify({ message: 'Build <%= file.relative %>' }));
});


// Get all *.js files concat and copy a minified and a normal version of them to ./build/js
gulp.task('scripts', function() {
  return gulp.src([
      src_paths.scripts + '/' + files.js_libs ,
      src_paths.scripts + '/' + files.js_scroller,
      src_paths.scripts + '/' + files.js_triggerresize,
      src_paths.scripts + '/' + files.js_plugins,
      src_paths.scripts + '/' + files.js_main
    ])
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(jshint( src_paths.scripts + '/.jshintrc'))
    //.pipe(jshint.reporter('default', { verbose: true }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest( build_paths.js ))
    .pipe(notify({
      message: 'Served "./build/js/<%= file.relative %>"!'
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest( build_paths.js ))
    .pipe(notify({ message:
      'Served "./build/js/<%= file.relative %>"!'
    }));
});

gulp.task('copy', function(){
  return gulp.src([
  ])
  .pipe(plumber(function (error) {
      gutil.log(error.message);
      this.emit('end');
  }))
  .pipe(gulp.dest( build_paths.js ));
});

// Optimize images and copy files from ./src/images to ./build/img
gulp.task('images', function() {
  return gulp.src( [src_paths.images + '.jpg', src_paths.images + '.png', src_paths.images + '.gif', src_paths.images + '.svg' ] )
    .pipe(changed( build_paths.img ))
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest( build_paths.img ))
    .pipe(notify({
      message: 'Images task complete'
    }));
});

gulp.task('fonts', function() {

    return gulp.src( src_paths.fonts )
      .pipe(changed( build_paths.fonts ))
      .pipe(gulp.dest( build_paths.fonts ))
      .pipe(notify({
        message: 'Copied "./build/fonts/<%= file.relative %>"'
      }));

});

gulp.task('clean', function(cb) {
    del([
      root.build + '*.html',
      build_paths.css + '/*.css',
      build_paths.js + '/*.js',
      build_paths.img + '/**/.*',
      build_paths.fonts+ '/**/.*'
    ], cb);
});


gulp.task('watch', ['webserver'], function() {

  // Watch .jade files
  // Watch .less files
  gulp.watch( src_paths.less + '/**/*.less', ['styles']);
  gulp.watch( src_paths.jade + '/**/*.jade', ['jade']);
  // Watch .js files
  gulp.watch( src_paths.scripts + '/**/*.js', ['scripts']);
  gulp.watch( src_paths.scripts + '/apps/**/*.js', ['scripts']);
  // Watch image files
  gulp.watch( src_paths.images, ['images']);


});

gulp.task('webserver', function() {
  gulp.src('public')
    .pipe(webserver({
      livereload: true,
      //directoryListing: true,
      open: false,
      //port: config.server.port
    }));
});

gulp.task('compile', ['jade', 'styles', 'scripts', 'copy', 'images', 'fonts'] );

gulp.task('create', ['clean', 'compile']);

// Default task
gulp.task('start', ['clean', 'compile', 'watch'] );

// Default task
gulp.task('default', ['clean', 'jade', 'styles', 'scripts', 'copy', 'images', 'fonts'] );




// ################################################ //
// Install Bower Components


var bower = require('bower'),
    underscore = require('underscore'),
    underscoreStr = require('underscore.string');


gulp.task('bower', function(cb){
  bower.commands.install([], {save: true}, {})
    .on('end', function(installed){
      cb(); // notify gulp that this task is finished
    });
});

var exclude = [];

gulp.task('bundle-libraries-auto', ['bower'], function(){
  var bowerFile = require('./bower.json');
  var bowerPackages = bowerFile.dependencies;
  var bowerDir = root.bower_components;
  var packagesOrder = [];
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
        if(underscoreStr.endsWith(file, '.js')){
          mainFile = file;
        }
      });
    }

    // make the full path
    mainFile = bowerDir + '/' + bowerPackage + '/' + mainFile;

    // only add the main file if it's a js file
    if(underscoreStr.endsWith(mainFile, '.js')){
      mainFiles.push(mainFile);
    }
  });

  // run the gulp stream
  return gulp.src(mainFiles)
    .pipe(concat( files.js_libs ))
    .pipe(gulp.dest( src_paths.scripts ));
});

gulp.task('bower-less', function(){
  var bootstrap_less_files = gulp.src( root.bower_components + '/bootstrap/less/**/*')
    .pipe(gulp.dest( src_paths.less + '/bootstrap' ));

  var fontawesome_less_files = gulp.src( root.bower_components + '/fontawesome/less/**/*')
    .pipe(gulp.dest( src_paths.less + '/font-awesome' ));

  return bootstrap_less_files, fontawesome_less_files;

});

gulp.task('bower-fonts', function(){
  var bootstrap_font_files = gulp.src( root.bower_components + '/bootstrap/fonts/**/*')
    .pipe(gulp.dest( root.src + 'fonts' ));

  var fontawesome_font_files = gulp.src( root.bower_components + '/fontawesome/fonts/**/*')
    .pipe(gulp.dest( root.src + 'fonts' ));

  return bootstrap_font_files, fontawesome_font_files;
});

gulp.task('bower-update', ['bundle-libraries-auto'], function() {
    gulp.start('bower-less', 'bower-fonts');
});
