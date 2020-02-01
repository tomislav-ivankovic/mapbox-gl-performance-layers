const path = require('path');
const webpack = require('webpack');

const PATHS = {
    src: path.join(__dirname, './src'),
    dist: path.join(__dirname, './dist')
};

module.exports = {
    mode: 'development',
    entry: {
        'mapbox-gl-performance-layers': PATHS.src + '/index.ts'
    },
    externals: {
        'mapbox-gl': 'mapbox-gl'
    },
    output: {
        path: PATHS.dist,
        filename: 'index.js',
        libraryTarget: 'umd'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            },
            {
                test: /\.(frag|vert|glsl)$/,
                use: {loader: 'webpack-glsl-loader'}
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    plugins: [
        new webpack.IgnorePlugin(/test\.ts$/)
    ]
};
