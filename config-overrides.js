module.exports = function override(config, env) {
    config.module.rules[2].oneOf.unshift({
        test: /\.(frag|vert|glsl)$/,
        use: {loader: 'webpack-glsl-loader'}
    });
    return config;
};
