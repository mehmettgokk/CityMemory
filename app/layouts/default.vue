<template>
  <div class="min-h-screen flex flex-col bg-default text-default">
    <header class="sticky top-0 z-40 border-b border-default bg-default/85 backdrop-blur-md">
      <UContainer class="h-16 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <span class="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm group-hover:rotate-[-6deg] transition-transform">
            <UIcon name="i-heroicons-map-pin-solid" class="w-5 h-5" />
          </span>
          <span class="font-display text-xl font-semibold text-highlighted leading-none">Şehir Hafızası</span>
        </NuxtLink>

        <nav class="flex items-center gap-1">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-highlighted hover:bg-muted transition-colors flex items-center gap-1.5"
            active-class="!text-primary bg-primary/10 hover:bg-primary/15"
          >
            <UIcon :name="item.icon" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ item.label }}</span>
            <span
              v-if="item.badge"
              class="ml-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white leading-none"
            >{{ item.badge }}</span>
          </NuxtLink>

          <div class="w-px h-5 bg-accented mx-2" />
          <ThemeToggle />
        </nav>
      </UContainer>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-default mt-12">
      <UContainer class="py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-dimmed">
        <p>Verileriniz yalnızca bu tarayıcıda saklanır — hesap gerekmez.</p>
        <p>
          Harita verisi
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" class="underline hover:text-muted">© OpenStreetMap katkıda bulunanları</a>
        </p>
      </UContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { usePlacesStore } from '../stores/places'

const store = usePlacesStore()
const toast = useToast()

// localStorage okunamadıysa (bozuk veri, kapalı depolama vb.) kullanıcıya haber ver
watch(() => store.loadError, (msg) => {
  if (msg) {
    toast.add({ title: 'Arşiv yüklenemedi', description: msg, color: 'warning', icon: 'i-heroicons-exclamation-triangle' })
  }
}, { immediate: true })

const nav = computed(() => [
  { to: '/explore', label: 'Keşfet', icon: 'i-heroicons-magnifying-glass' },
  {
    to: '/saved',
    label: 'Arşivim',
    icon: 'i-heroicons-bookmark',
    badge: store.isInitialized && store.savedPlaces.length ? store.savedPlaces.length : undefined
  }
])
</script>
