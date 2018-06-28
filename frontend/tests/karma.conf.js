"use strict";

const VueLoaderPlugin = require("vue-loader/lib/plugin");
const utils = require("../build/utils");
const webpack = require("webpack");

module.exports = (config) => {
    config.set({
        frameworks: ["mocha", "chai"],
        files: ["./specs/**/*.spec.js"],
        reporters: ["progress", "coverage"],
        port: 9876,  // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ["ChromeHeadless"],
        autoWatch: false,
        concurrency: Infinity,
        // custom
        plugins: [
            // launchers
            "karma-chrome-launcher",
            "karma-sourcemap-loader",
            // preprocessors
            "karma-webpack",
            "karma-coverage",
            // frameworks
            "karma-mocha",
            "karma-chai"
        ],
        preprocessors: {
            "./specs/**/*.js": [ "webpack", "sourcemap"],
            "../src/**/*": ["webpack", "sourcemap"],
        },
        coverageReporter: {
            reporters: [
                { type: 'text' },
                { type: 'text-summary' },
            ]
        },
        webpack: {
            resolve: {
                alias: {
                    "vue$": "vue/dist/vue.esm.js"
                },
                extensions: ["*", ".js", ".vue", ".json"]
            },
            devtool: 'inline-source-map',
            module: {
                rules: [
                    {
                        test: /\.vue$/,
                        use: "vue-loader"
                    },
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: ["env"]
                            }
                        }
                    },
                    {
                        test: /\.css$/,
                        use: "css-loader"
                    },
                    {
                        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                        loader: "url-loader",
                        options: {
                            limit: 10000,
                            name: utils.assetsPath("img/[name].[hash:7].[ext]")
                        }
                    },
                    {
                        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                        loader: "url-loader",
                        options: {
                            limit: 10000,
                            name: utils.assetsPath("fonts/[name].[hash:7].[ext]")
                        }
                    }
                ],
            },
            plugins: [
                new VueLoaderPlugin,
                new webpack.DefinePlugin({
                    'process.env': {
                        NODE_ENV: '"test"',
                        APP_NAME: '"StreetInfo"',
                        API_URL: '"http://localhost:3000/api/v1"',
                        REQUEST_TIMEOUT: 5000,
                        DEFAULT_CITY_NAME: '"Львів"',
                        RECAPTCHA_KEY: '"example"',
                        SIGN_IN_ROUTE_NAME: '"sign-in"',
                        LOCATION_TIMEOUT: 5000,
                        DEFAULT_CITIES_LIMIT: 10,
                        AUTH_CHECK_INTERVAL: 5000,
                        // GOOGLE_ANALYTICS_ID: "xxxxxx",
                        MIN_EMAIL_TEXT_LENGTH: 20,
                        MIN_EMAIL_SENDER_NAME_LENGTH: 2,
                        COORDINATES_PRECISION: 6
                    }
                })
            ]
        }
    })
};
