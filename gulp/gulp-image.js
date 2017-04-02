var gulp = require('gulp');
var gm = require('gulp-gm');
var print = require('gulp-print');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var requireDir = require('require-dir');

var files = gulp.src([
  'raw_images/**/*.jpg',
  'raw_images/**/*.png',
  'raw_images/**/*.gif',
]);



var exec = require('child_process').exec;

gulp.task('testo', function (cb) {
  exec('mogrify -path ..\\images\\large -scale "1920x1080^" -gravity north -crop 1920x1080+0+0 ..\\raw_images\\*.*', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})



gulp.task('image-large', function () {
  files
  	.pipe(gm(function (gmfile) {
      	return gmfile
            .crop(1920, 1080)
      			.resize(1920, 1080)
      			.gravity('North')
            .quality(40);
      }))
    .pipe(gulp.dest('images/large'))
    .pipe(print());
});


gulp.task('image-medium', function () {
  files
    .pipe(gm(function (gmfile) {
        return gmfile
            .resize(960, 1450)
            .gravity('North')
            .quality(50);
    }))
    .pipe(gulp.dest('images/medium'))
    .pipe(print());
});

gulp.task('image-small', function () {
  files
    .pipe(gm(function (gmfile) {
        return gmfile
            .resize(480, 275)
            .gravity('North')
            .quality(50);
    }))
    .pipe(gulp.dest('images/small'))
    .pipe(print());
});

gulp.task('image-thumbnail', function () {
  files
    .pipe(gm(function (gmfile) {
        return gmfile
            .resize(300, 200)
            .gravity('North')
            .quality(50);
    }))
    .pipe(gulp.dest('images/thumbnail'))
    .pipe(print());
});

gulp.task('image', [
    'testo'
    //'image-large',
    //'image-medium',
    //'image-small',
    //'image-thumbnail'
]);