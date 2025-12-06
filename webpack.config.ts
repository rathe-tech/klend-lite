import path from "path";
import { fileURLToPath } from "url";
import module from "node:module";
import webpack from "webpack";
import server from "webpack-dev-server";
import html from "html-webpack-plugin";
import vanilla from "@vanilla-extract/webpack-plugin";
import terser from "terser-webpack-plugin";
import copy from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
// @ts-ignore
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

type ExtendedConfig = webpack.Configuration & { devServer: server.Configuration };
type ConfigSelector = (env: any, argv: any) => ExtendedConfig;

const require = module.createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        "@components": path.resolve(__dirname, "src/components"),
        "@queries": path.resolve(__dirname, "src/queries"),
        "@misc": path.resolve(__dirname, "src/misc"),
        "@theme": path.resolve(__dirname, "src/theme"),
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
      new ForkTsCheckerWebpackPlugin(),
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