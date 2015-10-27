var gulp = require('gulp');
var del = require('del');
var notify = require('gulp-notify');

module.exports = function (gulp, plugins, path, cb) {
  return function () {
    var del_task = function(dist, cb){
      del([
        dist.html + '/**/*.html',
        dist.css + '/**/*.css',
        dist.js + '/**/*.js',
        dist.img + '/**/*.*',
        dist.fonts+ '/**/*.*'
      ], cb);
    };
    return del_task(path.dist, cb);
  };
};
