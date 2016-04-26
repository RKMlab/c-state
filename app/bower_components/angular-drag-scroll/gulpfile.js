var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var modRewrite = require('connect-modrewrite');
var gulp = require('gulp');

var config = {
	paths: {
		scripts: ['./src/*.js']
	}
};

// Build
gulp.task('build', function() {
	return gulp.src(config.paths.scripts)
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('dist/'));
	});

// Lint
gulp.task('lint', function() {
	return gulp.src(config.paths.scripts)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// Watch
gulp.task('watch', function() {
	gulp.watch(config.paths.scripts, ['lint']);
});

// Serve
gulp.task('serve', ['watch'], function() {
    browserSync.init({
        server: {
            baseDir: './',
            middleware: [
				modRewrite([
					'^/$ /demo.html'
				])
			]
        }
    });

    gulp.watch('*.html').on('change', browserSync.reload);
});

gulp.task('default', ['serve']);