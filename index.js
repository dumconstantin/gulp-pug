'use strict';

var objectAssign = require('object-assign');
var through = require('through2');
var defaultPug = require('pug');
var ext = require('gulp-util').replaceExtension;
var path = require('path');
var PluginError = require('gulp-util').PluginError;
var log = require('gulp-util').log;

module.exports = function gulpPug(options) {
  var opts = objectAssign({}, options);
  var pug = opts.pug || opts.jade || defaultPug;

  opts.data = objectAssign(opts.data || {}, opts.locals || {});

  return through.obj(function compilePug(file, enc, cb) {
    var data = objectAssign({}, opts.data, file.data || {});

    if (opts.localsPerFile) {
      var filename = path.basename(file.path);
      var fileext = path.extname(file.path);
      filename = filename.replace(fileext, '');
      data = data[filename] ? data[filename] : {};
    }

    opts.filename = file.path;
    file.path = ext(file.path, opts.client ? '.js' : '.html');

    if (file.isStream()) {
      return cb(new PluginError('gulp-pug', 'Streaming not supported'));
    }

    if (file.isBuffer()) {
      try {
        var compiled;
        var contents = String(file.contents);
        if (opts.verbose === true) {
          log('compiling file', file.path);
        }
        if (opts.client) {
          compiled = pug.compileClient(contents, opts);
        } else {
          compiled = pug.compile(contents, opts)(data);
        }
        file.contents = new Buffer(compiled);
      } catch (e) {
        return cb(new PluginError('gulp-pug', e));
      }
    }
    cb(null, file);
  });
};
