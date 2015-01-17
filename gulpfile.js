'use strict';

var gulp = require('gulp'),
    less = require('gulp-less'),
    haml = require('gulp-haml'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    webserver = require('gulp-webserver'),
    del = require('del');




// Paths for the App inviroment
var root = {
  src: './src/',
  build: './public/',
  bower_components: './src/bower_components'
};

// Paths to the Sourcefiles
var src_paths = {
  images: root.src + 'images/**/*',
  less: root.src + 'less',
  scripts: root.src + 'scripts'
};

//Build Path
var build_paths = {
  fonts: root.build + 'fonts',
  css: root.build + 'css',
  js: root.build + 'js',
  img: root.build + 'img'
};

var file_names = {
    js_libs : 'libs.js'
};


// Compile *.HAML to HTML and save it in ./public 
gulp.task('haml', function () {
  gulp.src('src/haml/**/*.haml')
    .pipe(haml({
        ext: '.html'
    }))
    .pipe(gulp.dest('public/'));
});


// Compile LESS to CSS minify, autoprefix and copy to ./public/css/

var LessPluginCleanCSS = require("less-plugin-clean-css"),
    cleancss = new LessPluginCleanCSS({advanced: true});

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix= new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

gulp.task('styles', function() {
    return gulp.src( src_paths.less + '/index.less')
    .pipe(less({
        plugins: [autoprefix, cleancss]
    }))
    .pipe(gulp.dest( build_paths.css ))
    .pipe(notify({ message: 'CSS write task complete' }));
});


// Get all *.js files concat and copy a minified and a normal version of them to ./build/js
gulp.task('scripts', function() {
  return gulp.src( src_paths.scripts + '/**/*.js')
    .pipe(jshint( src_paths.scripts + '/.jshintrc'))
    //.pipe(jshint.reporter('default', { verbose: true }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest( build_paths.js ))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest( build_paths.js ))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Optimize images and copy files from ./src/images to ./build/img
gulp.task('images', function() {
  return gulp.src( src_paths.images )
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest( build_paths.img ));
    //.pipe(notify({ message: 'Images task complete' }))
});

gulp.task('fonts', function() {

    var bootstrap_fonts = gulp.src( root.bower_components + 'bootstrap/fonts/*')
        .pipe(gulp.dest(build_paths.fonts));

    var fontawesome_fonts = gulp.src( root.bower_components + 'fontawesome/fonts/*')
        .pipe(gulp.dest(build_paths.fonts));

    return bootstrap_fonts, fontawesome_fonts;

});

gulp.task('clean', function(cb) {
    del(['public/css', 'public/js', 'public/img'], cb)
});


gulp.task('watch', ['webserver'], function() {

  // Watch .haml files
  gulp.watch('src/haml/**/*.haml', ['haml']);
  // Watch .less files
  gulp.watch('src/less/**/*.less', ['styles']);
  // Watch .js files
  gulp.watch('src/scripts/**/*.js', ['scripts']);
  // Watch image files
  gulp.watch('src/images/**/*', ['images']);


});

gulp.task('webserver', function() {
  gulp.src('app')
    gulp.src('public')
    .pipe(webserver({
      livereload: true,
      //directoryListing: true,
      open: true,
      port: "8000"
    }));
});

// Default task
gulp.task('start', ['clean', 'haml', 'styles', 'scripts', 'images', 'fonts'], function() {
    gulp.start('watch');
}); 
// Default task
gulp.task('default', ['clean', 'haml', 'styles', 'scripts', 'images', 'fonts'] ); 


// ################################################ //
// Install Bower Components


var bower = require('bower'),
    underscore = require('underscore'),
    underscoreStr = require('underscore.string')


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
    .pipe(concat( file_names.js_libs ))
    .pipe(gulp.dest( src_paths.scripts ));
});

gulp.task('bower-less', function(){
  var bootstrap_less_files = gulp.src( root.bower_components + '/bootstrap/less/**/*')
    .pipe(gulp.dest( src_paths.less + '/bootstrap' ));

  var fontawesome_less_files = gulp.src( root.bower_components + '/fontawesome/less/**/*')
    .pipe(gulp.dest( src_paths.less + '/font-awesome' ));

  return bootstrap_less_files, fontawesome_less_files;

});

gulp.task('bower-fonts', function(cb){
  var bootstrap_font_files = gulp.src( root.bower_components + '/bootstrap/fonts/**/*')
    .pipe(gulp.dest( root.src + 'fonts' ));

  var fontawesome_font_files = gulp.src( root.bower_components + '/fontawesome/fonts/**/*')
    .pipe(gulp.dest( root.src + 'fonts' ));

  return bootstrap_font_files, fontawesome_font_files;
});

gulp.task('bower-update', ['bundle-libraries-auto'], function() {
    gulp.start('bower-less', 'bower-fonts');
});
