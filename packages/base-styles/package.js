Package.describe({
  name: "base-styles",
  summary: "Nova basic styles package",
  version: "0.25.7",
  git: "https://github.com/TelescopeJS/Telescope.git"
});

Package.onUse(function (api) {

  api.versionsFrom(['METEOR@1.0']);

  api.use([
    'nova:core@0.25.7',
    'fourseven:scss@3.4.1',
    // 'juliancwirko:postcss@1.0.0-rc.4',
    // 'seba:minifiers-autoprefixer@0.0.1',
    // 'twbs:bootstrap@=4.0.0-alpha.2'
  ]);

  api.addFiles([
    'lib/stylesheets/bootstrap.css',

    // 'lib/stylesheets/solid.1.4.4.css',
    'lib/stylesheets/main.scss',
    // '/node_modules/bootstrap/dist/css/bootstrap.css',
    'lib/stylesheets/categories.scss',
    'lib/stylesheets/comments.scss',
    'lib/stylesheets/common.scss',
    'lib/stylesheets/posts.scss',
    'lib/stylesheets/users.scss'
  ], ['client']);

});
