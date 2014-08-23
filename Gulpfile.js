var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    util = require('gulp-util'),
    JSHintStylish = require('jshint-stylish'),
    uglify = require('gulp-uglifyjs');

var paths = {
    js: {
        root: './public/javascripts/',
        build: 'build.js'
    },
    bower: './public/bower_components/',
    build: './public/build/'
};

paths.js.src = [
    paths.js.root + 'main.js'
];

paths.js.lib = [
    paths.bower + 'jquery/dist/jquery.js',
    paths.bower + 'underscore/underscore.js',
    paths.bower + 'backbone/backbone.js',
    paths.bower + 'backbone.localStorage/backbone.localStorage.js'
];

paths.js.all = paths.js.lib.concat(paths.js.src);

gulp.task('lint-scripts', function () {
    console.log('Linting public JS');
    gulp.src(paths.js.src)
        // Lints JS
        .pipe(jshint().on('error', util.log))
        .pipe(jshint.reporter(JSHintStylish));
});

gulp.task(
    'build-scripts',
    function() {
        console.log(paths.js.all)
        gulp.src(paths.js.all)
    // Concat and Uglify concat'd JS file
        .pipe(uglify(paths.js.build, {
            mangle: false,
            outSourceMap: true
        }).on('error', util.log))
    // Dump JS build file
        .pipe(gulp.dest(paths.build))
    }
);

gulp.task('watch', function() {
    gulp.watch(paths.js.src, ['lint-scripts']);    
    gulp.watch(paths.js.src, ['build-scripts']);    
});

module.exports = gulp;