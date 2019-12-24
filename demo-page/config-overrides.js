const NODE_MODULES_DIR = process.cwd() + '/node_modules';

module.exports = function override(config, env) {
    return {
        ...config,
        resolve: {
            ...config.resolve,
            alias: {
                ...config.resolve.alias,
                // This configuration is necessary because of this bug: https://github.com/webpack/webpack/issues/554
                // It makes sure that there there is only one instance of each peer dependency.
                // It forces the import statements that load these dependencies to always use the same absolute paths.
                'mapbox-gl': NODE_MODULES_DIR + '/mapbox-gl',
                'react-mapbox-gl': NODE_MODULES_DIR + '/react-mapbox-gl',
                'react': NODE_MODULES_DIR + '/react',
                'react-dom': NODE_MODULES_DIR + '/react-dom'
            }
        }
    };
};
