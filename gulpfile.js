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

//gzip js
gulp.task('gzip', function () {
  return gulp.src('./dist/DOMSnap.min.js')
    .pipe($.gzip({ append: true }))
    .pipe(gulp.dest('./dist'))
    .pipe($.size({title: 'gzip'}));
});

//build doc
gulp.task('doc', function () {
  gulp.src('./lib/DOMSnap.js')
    .pipe($.documentation({ format: 'md'}))
    .pipe(gulp.dest('./doc'));
});


//watching script change to start default task
gulp.task('watch', function () {
  return gulp.watch(['lib/**/*.js'], function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    runSequence('dist');
  });
});

//buid and dist lib
gulp.task('dist', function (cb) {
  runSequence('build', 'min', 'gzip', 'doc', cb);
});

gulp.task('default', function (cb) {
  runSequence('dist', 'watch', cb);
});
