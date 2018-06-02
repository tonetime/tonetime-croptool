
var gulp = require('gulp')
var inject = require('gulp-inject');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();
//  var uglify = require("gulp-uglify");
let uglify = require('gulp-uglify-es').default;
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var pump = require('pump');

gulp.task('inject', function () {
  var target = gulp.src('./src/*.html');
  var sources = gulp.src(['./src/**/*.js', './src/**/*.css'], {read: false});
  return target.pipe(inject(sources, {relative: true}))
    .pipe(gulp.dest('./src'))
    pipe(browserSync.stream());
});
gulp.task('browser-sync',function() {
    browserSync.init({
        server: {
            baseDir: "./src"
        }
    });
    gulp.watch(['./src/**/*.js', './src/**/*.css'], gulp.series('inject'));
    gulp.watch("./src/*.html").on('change', browserSync.reload)
});
gulp.task('dist', function (cb) {
  pump([
        gulp.src(['./src/**/*.js', '!./src/lib/*']),
        concat('tonetime-croptool.js'),
        uglify(),
        gulp.dest('dist')
    ],
    cb
  );
});
gulp.task('default', gulp.series('browser-sync'))
