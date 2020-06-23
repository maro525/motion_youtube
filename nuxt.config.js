const routerBase = process.env.USE_SUBFOLDER === "true" ? {
  router: {
    base: "/motion_youtube/"
  }
} : {}

module.exports = {
  ...routerBase,
  /*
  ** Headers of the page
  */
  head: {
    title: 'motion_youtube',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    vender: ['@tensorflow/tfjs', '@tensorflow-models/posenet', '@tensorflow-models/body-pix', 'axios'],
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  generate: {
    dir: "motion_youtube"
  },
  css: [
    { src: '~assets/main.scss', lang: 'scss'}
  ],
  webfontloader: {
    google: {
      families: ['Noto+Sans+JP']
    }
  },
}

