module.exports = function (grunt) {
  function git(args, callback) {
    var cmd = (['git'].concat(args)).join(' ');

    grunt.util.spawn({
      cmd: 'git',
      args: args
    }, function gitDone(error, result) {
      grunt.verbose.subhead('`' + cmd + '`:');
      grunt.verbose.writeln(result.stdout);

      if (error) {
        grunt.log.error(result.stderr);
        return callback(grunt.util.error(cmd + ' failed', error), result);
      }

      callback(null, result);
    });
  }

  function tagFromBowerVersion() {
    grunt.config.requires('bower.version');
    var bowerVersion = grunt.config.get('bower.version');
    var npmVersion = grunt.config.get('pkg.version');

    if (npmVersion && npmVersion !== bowerVersion) {
      grunt.warn('Versions in package.json (' + npmVersion + ') and bower.json (' + bowerVersion + ') do not match!');
    }

    var tag = 'v' + bowerVersion;
    grunt.log.debug('Version tag from bower.json: ' + tag);
    return tag;
  }


  grunt.registerTask('tag', 'Ensure remote repo is tagged with current package version.', ['tag:local', 'tag:push']);


  grunt.registerTask('tag:local', 'Tag the repo with the current package version if not already tagged.', function tagTask() {
    var tag = tagFromBowerVersion();

    var done = this.async();

    git(['tag', '-l', tag], function gitTagCheckDone(error, result) {
      if (error) {
        return done(error);
      }

      var existingTag = result.stdout;
      grunt.log.debug('Checking for existing tag ' + tag + ': ' + existingTag);

      if (tag === existingTag) {
        grunt.verbose.writeln('Tag ' + tag + ' already exists, nothing to do.');
        return done();
      } else if (existingTag.length > 0) {
        return done(grunt.util.error('Unexpected output checking for existing tag: ' + existingTag));
      }

      git(['tag', tag], function gitTagDone(error) {
        if (error) {
          return done(error);
        }

        grunt.log.ok('Created tag ' + tag);
        done();
      });
    });
  });


  grunt.registerTask('tag:push', 'Ensure tag for current package version is pushed.', function pushTask() {
    var remote = grunt.config.get('git.options.remote') || 'origin';
    grunt.log.debug('git remote: ' + remote);
    var tag = tagFromBowerVersion();

    var done = this.async();

    git(['push', '--porcelain', '--tags', remote, tag], function gitPushDone(error, result) {
      if (error) {
        return done(error);
      }

      var tagMatch = '\\s+[^:]+:refs/tags/' + tag.replace(/\./g, '\\.');
      var newTagRe =    new RegExp('^\\*' + tagMatch, 'm');
      var existingTagRe = new RegExp('^=' + tagMatch, 'm');
      var stdout = result.stdout;

      if (stdout.match(newTagRe)) {
        grunt.log.ok('Pushed tag ' + tag + ' to ' + remote);
        return done();
      } else if (stdout.match(existingTagRe)) {
        grunt.verbose.writeln(remote + ' already has tag ' + tag);
        return done();
      } else {
        return done(grunt.util.error('Unexpected output pushing tag to ' + remote + ': ' + stdout));
      }
    });
  });
};
