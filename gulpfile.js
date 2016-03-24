var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var webpackStream = require("webpack-stream");

//compile js
var webpackConfig = require('./webpack.config');
gulp.task("build", function() {
  return gulp.src(['./lib/**/*.js'])
    .pipe(webpackStream(webpackConfig['build']))
    .pipe(gulp.dest('./dist'))
    .pipe($.size({title: 'build'}));
});

//min js
gulp.task('min', function () {
  return gulp.src('./dist/DOMSnap.js')
    .pipe($.uglify())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist'))
    .pipe($.size({title: 'min'}));
});

gulp.task('default', function (cb) {
  runSequence('build', 'min', cb);
});
