var gulp = require('gulp');
var JSHintStylish = require('jshint-stylish');
var mapStream = require('map-stream');
var gp = require('gulp-load-plugins')();

function jsHintReporter(taskName) {
    var noErrors = true;
    var stream = mapStream(function (file, cb) {
        if (!file.jshint.success) {
            noErrors = false;
            console.log('JSHINT fail in ' + file.path);
            file.jshint.results.forEach(function (err) {
                var filePathDirs = err.file.split('/');
                var filePath = filePathDirs.slice(
                    filePathDirs.length - 2, 
                    filePathDirs.length
                ).join('/');
                if (err.error) {
                    console.log('' + filePath + ': line ' + err.error.line + ' | col ' + err.error.character + ' | ' + err.error.reason);
                }
            });
        }

        cb(null, file);
    });

    if (noErrors) {
        console.log(taskName + ': 0 jsHint issues!');
    }
    return stream;
}


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

paths.scss.src = [paths.scss.root + 'main.scss'];

paths.scss.watch = [paths.scss.root + '**/*.scss'];

paths.js.src = [
    paths.js.root + 'main.js',
    paths.js.root + 'forms.js',
    paths.js.root + 'sockets/index.js',
    paths.js.root + 'models/ModelTile.js',
    paths.js.root + 'collections/CollectionTiles.js',
    paths.js.root + 'views/ViewTile.js',
    paths.js.root + 'views/ViewBoard.js'
];

paths.js.lib = [
    paths.bower + 'jquery/dist/jquery.js',
    paths.bower + 'lodash/dist/lodash.underscore.js',
    paths.bower + 'backbone/backbone.js',
    paths.bower + 'backbone.localStorage/backbone.localStorage.js',
    paths.bower + 'socket.io-client/socket.io.js'
];

paths.js.server = [
    './app.js',
    './sockets/**/*.js',
    './models/**/*.js',
    './routes/**/*.js'
];

var options = {
    uglify: {
        mangle: false,
        outSourceMap: true,
        basePath: './public/build'
    },
    scss: {
        style: 'compressed'
    }
}

paths.js.all = paths.js.lib.concat(paths.js.src);

gulp.task('build-styles', function(){
    var stream = gulp.src(paths.scss.src)
    // Rename scss file
        .pipe(gp.rename(paths.scss.build))
    // Compile scss
        .pipe(gp.rubySass(options.scss))
        .on('error', gp.util.log)
    // Dump css build file
        .pipe(gulp.dest(paths.build));
    return stream;
});

gulp.task('lint-client-scripts', function(){
    var stream = gulp.src(paths.js.src)
        // Lints JS
        .pipe(gp.jshint())
        .pipe((new jsHintReporter('lint-client-scripts')));
    return stream;
});

gulp.task('lint-server-scripts', function(){
    var stream = gulp.src(paths.js.server)
        // Lints JS
        .pipe(gp.jshint())
        .pipe((new jsHintReporter('lint-server-scripts')));
    return stream;
});

gulp.task('build-scripts', function(){
        console.log('Building scripts');
        var stream = gulp.src(paths.js.all)
    // Concat and Uglify concat'd JS file
            .pipe(
                gp.uglifyjs(paths.js.build, options.uglify).on('error', gp.util.log)
            )
        // Dump JS build file
            .pipe(gulp.dest(paths.build));
    return stream;
});

gulp.task('watch', function() {
    gulp.watch(paths.js.src, ['lint-client-scripts']);    
    gulp.watch(paths.js.server, ['lint-server-scripts']);    
    gulp.watch(paths.js.src, ['build-scripts']);    
    gulp.watch(paths.scss.watch, ['build-styles']);    
});

gulp.task('scripts', [
    'lint-client-scripts',
    'lint-server-scripts',
    'build-scripts'
]);

gulp.task('dev', [
    'scripts',
    'build-styles',
    'watch'
]);

gulp.task('default', ['dev']);

module.exports = gulp;