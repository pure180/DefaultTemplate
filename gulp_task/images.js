'use-strict';
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var notify = require('gulp-notify');



module.exports = function (gulp, plugins, path) {
  return function () {
    var images_task = function(src, dist, note){
      return gulp.src( [src + '**/*.jpg', src + '**/*.png', src + '**/*.gif', src + '**/*.svg' ] )
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest( dist ))
        .pipe(notify({
          message: note
        }));
    };

    return images_task(path.src.img, path.dist.img, 'Served Image "<%= file.relative %>"!' );

  };
};
