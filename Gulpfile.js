var gulp = require('gulp');
var JSHintStylish = require('jshint-stylish');
var gp = require('gulp-load-plugins')();

var paths = {
    scss: {
        root: './public/stylesheets/',
        build: 'build.scss'        
    },
    js: {
        root: './public/javascripts/',
        build: 'build.js'
    },
    bower: './public/bower_components/',
    build: './public/build/'
};

paths.scss.src = [
    paths.scss.root + 'main.scss'
];

paths.js.src = [
    paths.js.root + 'main.js'
];

paths.js.lib = [
    paths.bower + 'jquery/dist/jquery.js',
    paths.bower + 'underscore/underscore.js',
    paths.bower + 'backbone/backbone.js',
    paths.bower + 'backbone.localStorage/backbone.localStorage.js',
    paths.bower + 'socket.io-client/socket.io.js'
];

var options = {
    uglify: {
        mangle: false,
        outSourceMap: true
    },
    scss: {
        style: 'compressed'
    }
}

paths.js.all = paths.js.lib.concat(paths.js.src);

gulp.task(
    'build-styles',
    function() {
        gulp.src(paths.scss.src)
    // Rename scss file
        .pipe(gp.rename(paths.scss.build))
    // Compile scss
        .pipe(gp.rubySass(options.scss))
        .on('error', gp.util.log)
    // Dump css build file
        .pipe(gulp.dest(paths.build))
    }
);

gulp.task('lint-scripts', function () {
    gulp.src(paths.js.src)
        // Lints JS
        .pipe(gp.jshint().on('error', gp.util.log))
        .pipe(gp.jshint.reporter(JSHintStylish));
});

gulp.task(
    'build-scripts',
    function() {
        gulp.src(paths.js.all)
    // Concat and Uglify concat'd JS file
        .pipe(
            gp.uglifyjs(paths.js.build, options.uglify).on('error', gp.util.log)
        )
    // Dump JS build file
        .pipe(gulp.dest(paths.build))
    }
);

gulp.task('watch', function() {
    gulp.watch(paths.js.src, ['lint-scripts']);    
    gulp.watch(paths.js.src, ['build-scripts']);    
    gulp.watch(paths.scss.src, ['build-styles']);    
});

gulp.task('dev', [
    'lint-scripts',
    'build-scripts',
    'build-styles',
    'watch'
]);

module.exports = gulp;