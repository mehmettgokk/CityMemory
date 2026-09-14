export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: false },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  css: [
    '~/assets/css/main.css',
    'leaflet/dist/leaflet.css'
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'tr' },
      title: 'Şehir Hafızası',
      meta: [
        { name: 'description', content: 'Şehirleri keşfet, ilgini çeken yerleri kişisel gezi arşivine kaydet.' }
      ]
    }
  },

  compatibilityDate: '2026-09-11'
})
