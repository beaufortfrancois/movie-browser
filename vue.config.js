const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    optimization: {
      minimize: true,
      minimizer: [
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
            },
            mangle: {
              properties: {
                regex: /^_/
              }
            },
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ]
    }
  },
  chainWebpack: config => {
    // More aggressive minification for production
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer('terser').tap(args => {
        args[0].terserOptions.mangle = {
          ...args[0].terserOptions.mangle,
          properties: {
            regex: /^_/,
            reserved: ['$', 'exports', 'require']
          }
        }
        args[0].terserOptions.compress = {
          ...args[0].terserOptions.compress,
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
          passes: 2
        }
        return args
      })
    }
  }
})
