const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: "./src/site/assets/js/entry.js",
	output: {
		path: path.join(__dirname, "/dist/"),
		filename: "bundle.js"
	},
	devtool: "cheap-module-eval-source-map",
	module: {
		rules: [
			{
				test: /\.html$/,
				loader: "html-loader",
				options: {
					minimize: true
				}
			},
			{
				test: /\.css$/,
		        use: ExtractTextPlugin.extract({
		          fallback: "style-loader",
		          use: "css-loader"
		        })
			},
			{
				test: /\.(js|jsx)$/,
				loader: "babel-loader",
				exclude: /node_modules/,
				query: {
					presets: ["es2015", "react"]
				}
			},
		]
	},
	devServer: {
		contentBase: path.join(__dirname, "/dist/"),
	},
	plugins: [
		new ExtractTextPlugin("styles.css"),
		new HtmlWebpackPlugin({
			filename:"./index.html",
			template: "./src/site/index.html"
		})
	]
};