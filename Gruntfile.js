/* vim: set foldmethod=indent: */

module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      src: {
        src: ['src/**/*.js'],
        options: {
          bitwise: true,
          eqeqeq: true,
          forin: true,
          immed: true,
          indent: 2,
          latedef: true,
          multistr: true,
          newcap: true,
          strict: true,
          trailing: true,
          undef: true,
          unused: "vars"
        }
      }
    },
    karma: {
      unit: {
        options: {
          files: [
            'bower_components/angular/angular.js',
            'src/**/*.js',

            'bower_components/angular-mocks/angular-mocks.js',
            'test/**/*.js'
          ]
        },
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        reporters: ['progress', 'coverage'],
        singleRun: true,

        coverageReporter: {
          reporters: [
            {type: 'html', dir: 'coverage/'},
            {type: 'text-summary'} // to stdout
          ]
        },

        preprocessors: {
          'src/**/*.js': ['coverage']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('check', ['jshint']);
  grunt.registerTask('test', ['karma']);

  grunt.registerTask('default', ['check', 'test']);
};
