export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  
  css: [
    '~/assets/css/main.css', 
    'leaflet/dist/leaflet.css'
  ],
  
  compatibilityDate: '2026-09-11'
})