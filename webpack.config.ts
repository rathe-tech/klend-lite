import * as path from "path";
import * as webpack from "webpack";
import * as server from "webpack-dev-server";
import * as html from "html-webpack-plugin";
import * as vanilla from "@vanilla-extract/webpack-plugin";
import * as terser from "terser-webpack-plugin";
import * as copy from "copy-webpack-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";

type ExtendedConfig = webpack.Configuration & { devServer: server.Configuration };
type ConfigSelector = (env: any, argv: any) => ExtendedConfig;

const config: ConfigSelector = (env, argv) => {
  console.log("Passed env:", env);
  console.log("Passed argv:", argv);

  const mode = argv.mode ?? "production";
  console.log("Current mode:", mode);

  return {
    mode,
    entry: {
      "klend": "./src/index.tsx"
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
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": false,
        "path": false,
        "util": false,
        "os": false,
        "fs": false,
        "vm": false,
        "http": false,  // for wallet provider
        "https": false, // for wallet provider
        "url": false,   // for wallet provider
        "zlib": false,  // for wallet provider
      },
      alias: {
        process: "process/browser",
        "@queries": path.resolve(__dirname, "src/queries"),
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
      new copy({ patterns: [{ from: "public/icon_32.png" }] }),
      new copy({ patterns: [{ from: "public/icon_128.png" }] }),
      new vanilla.VanillaExtractPlugin(),
      new MiniCssExtractPlugin({ filename: "theme.css" }),
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: 'process/browser',
      })
    ],
    optimization: {
      minimize: mode === "production" ? true : false,
      minimizer: [new terser()],
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
      historyApiFallback: true,
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
    },
  };
};

export default config;