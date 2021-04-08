const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js',
  },
  output: {
    library: 'wechat-mqtt',
    libraryTarget: 'umd',
    filename: 'index.js',
    globalObject: "this",
    path: path.resolve(__dirname, 'umd'),
  },
}
