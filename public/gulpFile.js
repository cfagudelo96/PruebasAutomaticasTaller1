'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');
var swPrecache = require('sw-precache');

function writeServiceWorkerFile(rootDir, handleFetch, callback) {
  var config = {
    cacheId: 'appShell',
    handleFetch: handleFetch,
    logger: $.util.log,
    runtimeCaching: [{
      urlPattern: /^https:\/\/api-ratp.pierre-grimaud\.fr\/v3\/schedules/,
      handler: 'cacheFirst',
      options: {
        cache: {
          maxEntries: 10,
          name: 'runtime-cache'
        }
      }
    }],
    staticFileGlobs: [
      rootDir + '/styles/**.css',
      rootDir + '/**.html',
      rootDir + '/images/**.*',
      rootDir + '/scripts/**.js',
      rootDit + '/manifest.json'
    ],
    stripPrefix: rootDir + '/',
    verbose: true
  };
  swPrecache.write(path.join(rootDir, 'service-worker.js'), config, callback);
}

gulp.task('generate-service-worker-dev', function(callback) {
  writeServiceWorkerFile('./', true, callback);
});
