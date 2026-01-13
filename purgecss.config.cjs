module.exports = {
  // Pages/templates + JS are scanned to discover used selectors.
  content: [
    '*.html',
    'index.html',
    'pages/**/*.html',
    'posts/**/*.html',
    'templates/**/*.html',
    'js/**/*.js',
  ],

  // Start focused: purge only the site-authored CSS that tends to grow.
  // (If you later want to include more files, add them here.)
  css: [
    'css/homepage.css',
    'css/blog-post.css',
  ],

  // Output written by `npm run css:purge`.
  output: 'output/purgecss',

  // Emit details so you can review what would be removed.
  rejected: true,
  rejectedCss: true,

  // Protect selectors added at runtime (JS toggles) and other dynamic classes.
  safelist: {
    standard: [
      'show-all',
      'expanded',
      'hidden-article',
      'hidden-podcast',
    ],
  },
};
