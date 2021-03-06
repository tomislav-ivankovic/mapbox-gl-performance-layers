const path = require('path');
const webpack = require('webpack');

const PATHS = {
    src: path.join(__dirname, './src'),
    dist: path.join(__dirname, './dist')
};

module.exports = {
    mode: 'development',
    entry: {
        'react-mapbox-gl-performance-layers': PATHS.src + '/index.ts'
    },
    externals: {
        'mapbox-gl-performance-layers': 'mapbox-gl-performance-layers',
        'mapbox-gl': 'mapbox-gl',
        'react-mapbox-gl': 'react-mapbox-gl',
        'react': 'react',
        'react-dom': 'react-dom'
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
                test: /\.(tsx)|(ts)$/,
                loader: 'ts-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    plugins: [
        new webpack.IgnorePlugin(/test\.ts$/)
    ]
};
