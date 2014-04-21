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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('check', ['jshint']);

  grunt.registerTask('default', ['check']);
};
