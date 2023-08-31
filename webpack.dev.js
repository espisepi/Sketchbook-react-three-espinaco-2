// const merge = require('webpack-merge'); // old version code
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  //   devtool: "eval-source-map", // first-cart-shooter configuration
  devServer: {
    // progress: true,
    // liveReload: false,
    // first-cart-shooter configuration below
    static: {
      //   directory: path.join(__dirname, "../../dist/client"),     // first-cart-shooter configuration below
      directory: path.join(__dirname, ""),
    },
    hot: true,
    proxy: {
      "/socket.io": {
        target: "http://127.0.0.1:3000",
        ws: true,
      },
    },
  },
});
