const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (_env, argv) => {
  const prod = argv.mode === 'production';
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: prod ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
      assetModuleFilename: 'assets/[name].[contenthash:8][ext][query]',
      publicPath: prod ? './' : '/',
      clean: true,
    },
    devtool: prod ? false : 'source-map',
    module: {
      rules: [
        { test: /\.css$/i, use: [prod ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'] },
        { test: /\.(png|jpe?g|gif|svg|webp)$/i, type: 'asset/resource' },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './src/index.html', title: 'Orbit Desk — RxJS Workspace' }),
      new webpack.DefinePlugin({ __PRODUCTION__: JSON.stringify(prod) }),
      ...(prod ? [new MiniCssExtractPlugin({ filename: 'assets/[name].[contenthash:8].css' })] : []),
    ],
    devServer: {
      port: 8080,
      host: 'localhost',
      hot: true,
      historyApiFallback: true,
      client: { overlay: true },
      proxy: [
        { context: ['/messages', '/posts'], target: 'http://localhost:7071', changeOrigin: true },
      ],
    },
  };
};
