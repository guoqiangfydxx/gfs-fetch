var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var Server = require('karma').Server;
var webpackServer = require('./webpack/webpack-dev.config');
var webpackConfig = require('./webpack/webpack.config');
var open = require('gulp-open');
var del = require('del');
var internalIP = require('internal-ip');
var babel = require('gulp-babel');

var config = require('./package.json');

var error = function(e){
    console.error(e);
    if(e.stack){
        console.error(e.stack);
    }
    process.exit(1);
};
// __dirname表示当前工作的目录
gulp.task('karma', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});
// __filename表示正在执行的脚本的文件名
gulp.task('open', function () {
    gulp.src(__filename)
        .pipe(open({uri: "http://"+(internalIP.v4() || '127.0.0.1')+":8081/index.html"}));
});

gulp.task('hot', function (callback) {
    webpackServer();

});

gulp.task('require-webpack', function(done) {
    webpack(webpackConfig).run(function(err, stats) {
        if(err) throw new gutil.PluginError("require-webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        done();
    });
});

gulp.task('min-webpack', function(done) {

    var wbpk = Object.create(webpackConfig);
    wbpk.output.filename = config.name+'.min.js';
    wbpk.plugins.push(new webpack.optimize.UglifyJsPlugin());

    webpack(wbpk).run(function(err, stats) {
        if(err) throw new gutil.PluginError("min-webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        done();
    });
});
gulp.task('watch', function () {
    gulp.watch(['./lib/**/*.*'], ['demo']);
});

gulp.task('copy',  function(done) {
    gulp.src(__dirname+'/dist/example.js')
        .pipe(gulp.dest(__dirname+'/example/dist/'));
    del([__dirname+'/dist/example.js'],done);
});


gulp.task('default', ['require-webpack']);
gulp.task('test',['karma']);
gulp.task('demo', ['hot','open']);
gulp.task('min',['min-webpack','copy']);
