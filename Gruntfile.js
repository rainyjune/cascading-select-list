module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    csslint: {
      strict: {
        options: {
          import: 2
        },
        src: ['src/style.css']
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/style.min.css': ['src/style.css']
        }
      }
    },
    jshint: {
      all: ['src/select.js']
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/select.js',
        dest: 'dist/select.min.js'
      }
    },
    watch: {
      js: {
        files: ['src/select.js'],
        tasks: ['jshint', 'uglify'],
      },
      css: {
        files: ['src/style.css'],
        tasks: ['csslint', 'cssmin'],
      }
    }
  });
  

  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['watch']);

};