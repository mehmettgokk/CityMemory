<template>
  <div>
    <section ref="heroEl" class="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      <!-- Arka plan: şehir silueti (yavaş parallax) -->
      <div
        class="absolute inset-x-0 bottom-0 pointer-events-none will-change-transform"
        :style="skylineStyle"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1440 320" class="w-full h-[260px] sm:h-[320px] text-stone-300 dark:text-stone-800" preserveAspectRatio="none">
          <path
            fill="currentColor"
            opacity="0.5"
            d="M0 320V220h60v-40h40v40h50v-90h30l15-30 15 30h30v90h60v-60h50v60h40v-120h30l20-40 20 40h30v120h70v-50h60v50h50v-90h40v90h60v-70h30l25-60 25 60h30v70h60v-40h50v40h60v-110h40v110h50v-60h60v60h40v-90h30l20-35 20 35h30v90h60v-50h50v50V320z"
          />
          <path
            fill="currentColor"
            d="M0 320v-70h80v-30h60v30h70v-50h40l15-25 15 25h40v50h90v-40h70v40h60v-80h30l20-30 20 30h30v80h90v-30h60v30h80v-60h50v60h60v-45h40l20-40 20 40h40v45h70v-30h60v30h60v-70h50v70h80v-40h60v40V320z"
          />
        </svg>
      </div>

      <!-- Orta katman: iğneler (hızlı parallax + düşme animasyonu) -->
      <div class="absolute inset-0 pointer-events-none will-change-transform" :style="pinsStyle" aria-hidden="true">
        <div
          v-for="(pin, i) in pins"
          :key="i"
          class="absolute pin-drop"
          :class="pin.mobile ? '' : 'hidden sm:block'"
          :style="{ left: pin.x + '%', top: pin.y + '%', animationDelay: `${400 + i * 120}ms` }"
        >
          <svg :width="pin.size" :height="pin.size" viewBox="0 0 24 24" fill="none" class="float-y drop-shadow-[0_6px_10px_rgba(60,40,20,0.25)]" :style="{ animationDelay: `${i * 300}ms` }">
            <path d="M12 22s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12z" :fill="pin.color" stroke="#fff" stroke-width="1.5" />
            <circle cx="12" cy="10" r="2.6" fill="#fff" />
          </svg>
        </div>
      </div>

      <!-- Ön plan: metin (scroll'da yukarı kayıp solar) -->
      <UContainer class="relative z-10 py-20 sm:py-28" :style="textStyle">
        <div class="max-w-3xl mx-auto text-center">
          <p class="hero-rise text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-primary" style="animation-delay: 100ms">
            Kişisel şehir hafızası
          </p>
          <h1 class="font-display font-semibold text-highlighted leading-[1.02] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl mt-5">
            <span class="block hero-rise" style="animation-delay: 220ms">Gördüğün,</span>
            <span class="block hero-rise" style="animation-delay: 340ms">göreceğin yerleri</span>
            <span class="block hero-rise text-primary italic font-medium" style="animation-delay: 460ms">bir deftere yaz.</span>
          </h1>
          <p class="hero-rise text-base sm:text-lg text-muted max-w-xl mx-auto mt-7 leading-relaxed" style="animation-delay: 600ms">
            Bir şehir ara, haritada ilgini çeken mekanı seç, arşivine ekle. Gittiğinde puanla, not al.
            Hesap yok, sunucu yok — her şey senin tarayıcında.
          </p>
          <div class="hero-rise flex flex-col sm:flex-row items-center justify-center gap-3 mt-10" style="animation-delay: 740ms">
            <UButton to="/explore" size="xl" color="primary" icon="i-heroicons-magnifying-glass" class="rounded-2xl px-7">
              Keşfetmeye başla
            </UButton>
            <UButton to="/saved" size="xl" color="neutral" variant="soft" icon="i-heroicons-bookmark" class="rounded-2xl px-7">
              Arşivim
            </UButton>
          </div>
        </div>
      </UContainer>

      <!-- Kaydır ipucu -->
      <div class="absolute bottom-6 inset-x-0 flex justify-center z-10 hero-rise" style="animation-delay: 1100ms" :style="textStyle">
        <a href="#nasil-calisir" class="scroll-hint flex flex-col items-center gap-1 text-[11px] uppercase tracking-widest text-muted hover:text-primary transition-colors">
          Kaydır
          <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
        </a>
      </div>
    </section>

    <!-- ================= NASIL ÇALIŞIR ================= -->
    <section id="nasil-calisir" class="py-24 sm:py-32 scroll-mt-16">
      <UContainer>
        <Reveal class="max-w-2xl mx-auto text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Nasıl çalışır</p>
          <h2 class="font-display text-4xl sm:text-5xl font-semibold text-highlighted mt-3 leading-tight">Üç adımda kendi şehir arşivin</h2>
        </Reveal>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          <Reveal v-for="(step, i) in steps" :key="step.title" :delay="i * 120" class="h-full">
            <div class="paper p-7 h-full relative overflow-hidden group">
              <span class="absolute -top-4 -right-2 font-display text-[7rem] leading-none font-semibold text-primary/8 select-none group-hover:text-primary/15 transition-colors">
                {{ i + 1 }}
              </span>
              <span class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UIcon :name="step.icon" class="w-6 h-6" />
              </span>
              <h3 class="font-display text-2xl font-semibold text-highlighted mt-5">{{ step.title }}</h3>
              <p class="text-sm text-muted leading-relaxed mt-2">{{ step.text }}</p>
            </div>
          </Reveal>
        </div>
      </UContainer>
    </section>

    <!-- ================= DEFTER ÖNİZLEME ================= -->
    <section class="py-24 sm:py-32 bg-muted/60 border-y border-default overflow-hidden">
      <UContainer>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Defterin</p>
            <h2 class="font-display text-4xl sm:text-5xl font-semibold text-highlighted mt-3 leading-tight">
              Aylar sonra açtığında<br />hâlâ hatırlıyor.
            </h2>
            <p class="text-muted leading-relaxed mt-5 max-w-md">
              "Bursa'da hangi yerleri görmek istiyordum?" ya da "Geçen ay gidip beğendiğim yer neresiydi?"
              Cevap, senin puanların ve notlarınla birlikte burada.
            </p>
            <ul class="mt-7 space-y-3 text-sm">
              <li v-for="f in features" :key="f" class="flex items-start gap-3 text-toned">
                <UIcon name="i-heroicons-check-circle-solid" class="w-5 h-5 text-success shrink-0 mt-0.5" />
                {{ f }}
              </li>
            </ul>
          </Reveal>

          <Reveal :delay="150">
            <div class="relative max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              <div class="absolute -inset-6 bg-primary/10 rounded-[2rem] rotate-3 blur-sm" aria-hidden="true" />
              <div class="relative rotate-[-2deg] hover:rotate-0 transition-transform duration-500 pointer-events-none select-none">
                <PlaceCard :place="samplePlace" />
              </div>
              <p class="text-[11px] text-dimmed text-center mt-6">Örnek kart — senin arşivin bomboş başlar.</p>
            </div>
          </Reveal>
        </div>
      </UContainer>
    </section>

    <!-- ================= GİZLİLİK + CTA ================= -->
    <section class="py-24 sm:py-32">
      <UContainer>
        <Reveal>
          <div class="paper relative overflow-hidden px-8 py-14 sm:px-16 sm:py-20 text-center">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" aria-hidden="true" />
            <div class="relative">
              <span class="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md">
                <UIcon name="i-heroicons-lock-closed" class="w-7 h-7" />
              </span>
              <h2 class="font-display text-4xl sm:text-5xl font-semibold text-highlighted mt-6 leading-tight">
                Hesap yok. Sunucu yok.<br />Sadece sen ve şehir.
              </h2>
              <p class="text-muted max-w-lg mx-auto mt-5 leading-relaxed">
                Kaydettiğin yerler, notların ve puanların yalnızca bu tarayıcıda saklanır.
                Harita ve mekan verisi OpenStreetMap topluluğundan gelir.
              </p>
              <UButton to="/explore" size="xl" color="primary" trailing-icon="i-heroicons-arrow-right" class="rounded-2xl px-8 mt-9">
                Bir şehir ara
              </UButton>
            </div>
          </div>
        </Reveal>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowScroll, usePreferredReducedMotion } from '@vueuse/core'
import type { SavedPlace } from '../types/place'

useSeoMeta({
  title: 'Şehir Hafızası — Kişisel gezi arşivin',
  description: 'Şehirleri keşfet, ilgini çeken yerleri kaydet, gittiğinde puanla ve not al. Hesap gerekmez; her şey tarayıcında kalır.'
})

const heroEl = ref<HTMLElement | null>(null)
const { y } = useWindowScroll()
const reducedMotion = usePreferredReducedMotion()

// Scroll'a bağlı parallax: her katman farklı hızda kayar
const parallax = (speed: number) => computed(() =>
  reducedMotion.value === 'reduce' ? {} : { transform: `translate3d(0, ${y.value * speed}px, 0)` }
)
const skylineStyle = parallax(0.12)
const pinsStyle = parallax(0.35)

const textStyle = computed(() => {
  if (reducedMotion.value === 'reduce') return {}
  const progress = Math.min(y.value / 480, 1)
  return {
    transform: `translate3d(0, ${y.value * 0.45}px, 0)`,
    opacity: String(1 - progress)
  }
})

// mobile: küçük ekranda da gösterilecek iğneler (diğerleri sm ve üstünde)
const pins = [
  { x: 8, y: 22, size: 34, color: '#d6673d', mobile: true },
  { x: 18, y: 62, size: 26, color: '#4f9a5e', mobile: false },
  { x: 30, y: 14, size: 22, color: '#5b7fb5', mobile: false },
  { x: 72, y: 18, size: 28, color: '#d99a2b', mobile: false },
  { x: 84, y: 48, size: 36, color: '#d6673d', mobile: true },
  { x: 92, y: 24, size: 22, color: '#8a6fb0', mobile: false },
  { x: 76, y: 66, size: 24, color: '#4f9a5e', mobile: false },
  { x: 12, y: 84, size: 20, color: '#d99a2b', mobile: true },
  { x: 88, y: 80, size: 26, color: '#5b7fb5', mobile: false }
]

const steps = [
  {
    icon: 'i-heroicons-magnifying-glass',
    title: 'Ara',
    text: 'Bir şehir, ilçe ya da mahalle yaz. Harita oraya uçar; müzeler, kafeler, tarihi yerler OpenStreetMap verisinden gelir.'
  },
  {
    icon: 'i-heroicons-bookmark',
    title: 'Kaydet',
    text: 'İlgini çeken mekanı tek dokunuşla arşivine ekle. Kategoriye göre filtrele, planladıklarını ayır.'
  },
  {
    icon: 'i-heroicons-pencil-square',
    title: 'Hatırla',
    text: 'Gittiğinde "ziyaret ettim" de, yıldız ver, birkaç satır not bırak. Defterin zamanla senin hikâyene dönüşür.'
  }
]

const features = [
  'Planlanan ve ziyaret edilen yerler ayrı listelenir',
  '1–5 yıldız puan ve kişisel gezi notu',
  'Kategoriye göre filtreleme: müze, kafe, park, tarihi yer…',
  'Veriler localStorage\'da; dışa aktarma için hesap gerekmez'
]

const samplePlace: SavedPlace = {
  id: 'ornek',
  name: 'Ulu Cami',
  category: 'mosque',
  latitude: 40.1839,
  longitude: 29.0616,
  address: 'Nalbantoğlu, Osmangazi, Bursa',
  status: 'visited',
  rating: 5,
  note: 'Hat sanatı örnekleri için tekrar gidilmeli. Sabah erken saatte çok sakin.',
  savedAt: '2026-08-20T10:00:00Z',
  visitedAt: '2026-08-28T10:00:00Z'
}
</script>
