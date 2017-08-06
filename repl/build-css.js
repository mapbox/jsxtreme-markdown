'use strict';

const path = require('path');
const Assembly = require('@mapbox/assembly');

// You'll have to re-run this every time codemirror.css changes.

Assembly.buildUserAssets(path.join(__dirname, './dist'), {
  files: [path.join(__dirname, './src/codemirror.css')],
  icons: []
});
