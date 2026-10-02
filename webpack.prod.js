const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
// const merge = require('webpack-merge');
const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            ascii_only: true,
          },
        },
      }),
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `Sketchbook 0.4 (https://github.com/swift502/Sketchbook)\nBuilt on three.js (https://github.com/mrdoob/three.js) and cannon.js (https://github.com/schteppe/cannon.js)`,
    }),
  ],
});
