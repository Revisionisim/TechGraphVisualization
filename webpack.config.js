const path = require('path');

module.exports = {
    mode: 'development', // 或 'production'
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
    // 其他配置...
}; 