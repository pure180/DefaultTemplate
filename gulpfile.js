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



var root = {
  src: './src/',
  build: './public/',
  bower_components: './bower_components/'
};

var src_paths = {
  images: 'src/img/**/*',
  less: root.src + 'less',
  scripts: root.src + 'scripts'
};

var build_paths = {
  fonts: root.build + 'fonts',
  css: root.build + 'css',
};

var LessPluginCleanCSS = require("less-plugin-clean-css"),
    cleancss = new LessPluginCleanCSS({advanced: true});

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix= new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

gulp.task('haml', function () {
  gulp.src('src/haml/**/*.haml')
    .pipe(haml({
        ext: '.html'
    }))
    .pipe(gulp.dest('public/'));
});

// Perform rendering of LESS to CSS
gulp.task('styles', function() {
    return gulp.src( src_paths.less + '/index.less')
    .pipe(less({
        plugins: [autoprefix, cleancss]
    }))
    .pipe(gulp.dest( build_paths.css ))
    .pipe(notify({ message: 'CSS write task complete' }));
});

gulp.task('scripts', function() {
  return gulp.src( src_paths.scripts + '/**/*.js')
    .pipe(jshint( src_paths.scripts + '/.jshintrc'))
    //.pipe(jshint.reporter('default', { verbose: true }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('public/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('public/img'));
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