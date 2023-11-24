import * as path from "path";
import * as webpack from "webpack";
import * as server from "webpack-dev-server";
import * as html from "html-webpack-plugin";
import * as vanilla from "@vanilla-extract/webpack-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";

const config: webpack.Configuration & { devServer: server.Configuration } = {
  mode: "development",
  entry: {
    "klend": "./src/index.ts"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "scripts/[name].bundle.js",
    publicPath: "/"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      "buffer": require.resolve("buffer/"),
      "process": false,
      "assert": false,
      "path": false,
      "util": false,
      "os": false,
      "fs": false
    }
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: {
        loader: "ts-loader"
      },
      exclude: /node_modules/
    }, {
      test: /\.css$/i,
      use: [MiniCssExtractPlugin.loader, "css-loader"],
    }]
  },
  plugins: [
    new html({ template: "public/index.html", inject: "head" }),
    new vanilla.VanillaExtractPlugin(),
    new MiniCssExtractPlugin({ filename: "theme.css" }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"]
    })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  devServer: {
    compress: false,
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    client: {
      overlay: false
    }
  },
  stats: {
    warnings: false,
    errors: true,
    timings: true
  }
};

export default config;