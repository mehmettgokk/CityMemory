<template>
  <UContainer class="py-8 lg:py-10 space-y-8">
    <section class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Arşivim</p>
        <h1 class="font-display text-4xl font-semibold text-highlighted leading-tight">Kaydettiğim yerler</h1>
        <p class="text-sm text-muted mt-2">
          Planladığın ve gittiğin mekanlar, notların ve puanlarınla birlikte.
        </p>
      </div>

      <div class="grid grid-cols-3 gap-3 md:w-auto">
        <div v-for="stat in stats" :key="stat.label" class="paper px-4 py-3 min-w-[96px]">
          <p class="text-2xl font-display font-semibold text-highlighted tabular-nums leading-none">{{ stat.value }}</p>
          <p class="text-[11px] text-muted mt-1.5 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full" :class="stat.dot" />
            {{ stat.label }}
          </p>
        </div>
      </div>
    </section>

    <section class="space-y-5">
      <div class="inline-flex p-1 rounded-xl bg-muted ring-1 ring-default">
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          type="button"
          class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
          :class="filterStatus === opt.value
            ? 'bg-elevated text-highlighted shadow-sm ring-1 ring-default'
            : 'text-muted hover:text-highlighted'"
          @click="filterStatus = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>

      <div
        v-if="!store.isInitialized"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div v-for="i in 3" :key="i" class="paper p-5 h-56 animate-pulse" />
      </div>

      <div
        v-else-if="filteredPlaces.length === 0"
        class="paper max-w-lg mx-auto text-center px-8 py-14"
      >
        <span class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
          <UIcon :name="store.savedPlaces.length ? 'i-heroicons-funnel' : 'i-heroicons-book-open'" class="w-8 h-8" />
        </span>
        <h3 class="font-display text-2xl font-semibold text-highlighted">
          {{ store.savedPlaces.length ? 'Bu filtrede mekan yok' : 'Defterin henüz boş' }}
        </h3>
        <p class="text-sm text-muted mt-2 mb-6 max-w-xs mx-auto">
          {{ store.savedPlaces.length
            ? 'Farklı bir filtre seç ya da yeni yerler keşfet.'
            : 'Bir şehir ara, ilgini çeken mekanları arşivine ekle; burada birikecekler.' }}
        </p>
        <UButton to="/explore" color="primary" icon="i-heroicons-magnifying-glass" class="rounded-xl">
          Mekan keşfet
        </UButton>
      </div>

      <TransitionGroup
        v-else
        tag="div"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        move-class="transition duration-300"
        leave-active-class="transition duration-200 absolute"
        leave-to-class="opacity-0 scale-95"
      >
        <PlaceCard
          v-for="place in filteredPlaces"
          :key="place.id"
          :place="place"
          @delete="askRemove"
        />
      </TransitionGroup>
    </section>

    <UModal v-model:open="confirmOpen" title="Arşivden kaldırılsın mı?" :ui="{ footer: 'justify-end' }">
      <template #body>
        <p class="text-sm text-toned">
          <strong class="text-highlighted">{{ pendingPlace?.name }}</strong> ile birlikte puanın ve notun da silinecek. Bu işlem geri alınamaz.
        </p>
      </template>
      <template #footer>
        <UButton color="neutral" variant="ghost" @click="confirmOpen = false">Vazgeç</UButton>
        <UButton color="error" icon="i-heroicons-trash" @click="confirmRemove">Kaldır</UButton>
      </template>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlacesStore } from '../stores/places'
import type { SavedPlace } from '../types/place'

const store = usePlacesStore()
const toast = useToast()
const filterStatus = ref('all')

const filterOptions = [
  { label: 'Tümü', value: 'all' },
  { label: 'Planlananlar', value: 'planned' },
  { label: 'Ziyaret edilenler', value: 'visited' }
]

const stats = computed(() => {
  const all = store.savedPlaces
  return [
    { label: 'Toplam', value: all.length, dot: 'bg-primary' },
    { label: 'Planlanan', value: all.filter(p => p.status === 'planned').length, dot: 'bg-warning' },
    { label: 'Gidilen', value: all.filter(p => p.status === 'visited').length, dot: 'bg-success' }
  ]
})

const filteredPlaces = computed(() => {
  if (!store.isInitialized) return []
  if (filterStatus.value === 'all') return store.savedPlaces
  return store.savedPlaces.filter(p => p.status === filterStatus.value)
})

const confirmOpen = ref(false)
const pendingPlace = ref<SavedPlace | null>(null)

const askRemove = (id: string) => {
  pendingPlace.value = store.getPlaceById(id) ?? null
  confirmOpen.value = true
}

const confirmRemove = () => {
  if (pendingPlace.value) {
    store.removePlace(pendingPlace.value.id)
    toast.add({ title: 'Arşivden kaldırıldı', description: pendingPlace.value.name, color: 'neutral' })
  }
  confirmOpen.value = false
  pendingPlace.value = null
}
</script>
