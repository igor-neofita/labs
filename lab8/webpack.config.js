const path = require('path');
module.exports = {
  entry: './src/index.ts',
  output: { filename: 'bundle.js', path: path.resolve(__dirname, 'dist') },
  resolve: { extensions: ['.ts', '.js'] },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] },
    ],
  },
};
