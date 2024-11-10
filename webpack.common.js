const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV === 'production'
            ? MiniCssExtractPlugin.loader // Gunakan MiniCssExtractPlugin di produksi
            : 'style-loader', // Gunakan style-loader di development
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'src/public/images/',
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'src/templates/index.html'),
      inject: 'body',
      headTags: [
        {
          tag: 'link',
          attributes: {
            rel: 'preload',
            href: 'https://fonts.gstatic.com',
            as: 'font',
            type: 'font/woff2',
            crossorigin: 'anonymous',
          },
        },
        {
          tag: 'link',
          attributes: {
            rel: 'preload',
            href: 'src/styles/main.css',
            as: 'style',
          },
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css', // Menghasilkan file CSS dengan hashing
    }),
  ],
};
