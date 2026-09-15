<template>
  <UContainer class="py-8 lg:py-10 space-y-6">
    <section class="max-w-2xl mx-auto text-center space-y-5">
      <div class="space-y-1.5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Keşfet</p>
        <h1 class="font-display text-3xl sm:text-4xl font-semibold text-highlighted leading-tight">
          Nereye gidiyoruz?
        </h1>
        <p class="text-sm text-muted max-w-md mx-auto">
          Bir şehir ya da mahalle ara; haritadaki mekanları arşivine ekle.
        </p>
      </div>

      <SearchInput @select="handlePlaceSelect" />
    </section>

    <section class="space-y-4">
      <div v-if="uniqueCategories.length > 0" class="flex items-center gap-3">
        <span class="text-xs font-semibold text-muted shrink-0 hidden sm:inline">Kategori</span>
        <CategoryFilter
          v-model="selectedCategory"
          :categories="uniqueCategories"
          :total="currentPlaces.length"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 relative paper overflow-hidden h-[440px] lg:h-[600px]">
          <ClientOnly>
            <Map
              :center="mapCenter"
              :places="visiblePlaces"
              :selected-id="selectedPlace?.id"
              @place-click="handleMarkerClick"
              @view-change="handleViewChange"
            />
            <template #fallback>
              <div class="w-full h-full flex items-center justify-center text-sm text-muted gap-2">
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                Harita yükleniyor…
              </div>
            </template>
          </ClientOnly>

          <!-- Harita üstü durum çubuğu -->
          <div class="absolute top-3 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 max-w-[calc(100%-1.5rem)]">
            <div
              v-if="overpass.error.value"
              class="flex items-center gap-2 text-xs bg-elevated/95 backdrop-blur ring-1 ring-error/30 text-error px-3 py-1.5 rounded-full shadow-sm"
            >
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 shrink-0" />
              <span class="truncate">Mekanlar yüklenemedi</span>
              <button type="button" class="font-semibold underline shrink-0" @click="loadPlaces(true)">Tekrar dene</button>
            </div>
            <div
              v-else-if="overpass.isLoading.value"
              class="flex items-center gap-2 text-xs font-medium bg-elevated/95 backdrop-blur ring-1 ring-default text-toned px-3 py-1.5 rounded-full shadow-sm"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin text-primary" />
              {{ overpass.isSlow.value ? 'Sunucular yoğun, alternatif deneniyor…' : 'Mekanlar yükleniyor…' }}
            </div>
            <div
              v-else-if="mapView && mapView.zoom < MIN_POI_ZOOM"
              class="flex items-center gap-2 text-xs font-medium bg-elevated/95 backdrop-blur ring-1 ring-default text-toned px-3 py-1.5 rounded-full shadow-sm"
            >
              <UIcon name="i-heroicons-magnifying-glass-plus" class="w-3.5 h-3.5 text-primary" />
              Mekanları görmek için bir şehir ara ya da yakınlaştır
            </div>
            <div
              v-else-if="mapView"
              class="text-xs font-semibold bg-elevated/95 backdrop-blur ring-1 ring-default px-3 py-1.5 rounded-full text-toned shadow-sm tabular-nums"
            >
              {{ visiblePlaces.length }} mekan
              <span v-if="selectedCategory !== 'all'" class="text-muted font-normal">· {{ formatCategory(selectedCategory) }}</span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1 lg:h-[600px]">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-200"
            enter-from-class="opacity-0 translate-y-1"
            leave-active-class="transition duration-100"
            leave-to-class="opacity-0"
          >
            <PlaceDetails
              v-if="selectedPlace"
              :key="selectedPlace.id"
              :place="selectedPlace"
              :is-saved="isPlaceSaved(selectedPlace.id)"
              :address-loading="addressLoading"
              @save="savePlace"
            />

            <div
              v-else
              class="h-full min-h-[260px] rounded-2xl border-2 border-dashed border-accented p-8 flex flex-col items-center justify-center text-center"
            >
              <span class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <UIcon name="i-heroicons-cursor-arrow-rays" class="w-7 h-7" />
              </span>
              <p class="font-display text-lg font-semibold text-highlighted">Henüz bir mekan seçilmedi</p>
              <p class="text-xs text-muted mt-1.5 max-w-[220px] leading-relaxed">
                Yukarıdan bir yer ara ya da haritadaki iğnelere tıkla; detaylar burada görünecek.
              </p>

              <div v-if="store.isInitialized && store.savedPlaces.length" class="mt-6 pt-5 border-t border-default w-full">
                <p class="text-[11px] text-dimmed mb-2">Arşivinde {{ store.savedPlaces.length }} mekan var</p>
                <UButton to="/saved" size="sm" color="neutral" variant="soft" icon="i-heroicons-bookmark">
                  Arşivime git
                </UButton>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { Place } from '../types/place'
import { usePlacesStore } from '../stores/places'
import { useOverpass } from '../composables/useOverpass'
import { formatCategory, isAreaCategory } from '../utils/category'
import type { MapView } from '../components/Map.vue'

const MIN_POI_ZOOM = 13

const store = usePlacesStore()
const toast = useToast()
const overpass = useOverpass()
const { reverse } = useNominatim()
const addressLoading = ref(false)

const selectedPlace = ref<Place | null>(null)
const searchedPlaces = ref<Place[]>([])
const selectedCategory = ref<string>('all')
const mapCenter = ref<{ lat: number, lng: number, zoom?: number } | undefined>(undefined)
const mapView = ref<MapView | null>(null)

const currentPlaces = computed<Place[]>(() => {
  const seen = new Set<string>()
  const merged: Place[] = []
  for (const p of [...searchedPlaces.value, ...overpass.places.value]) {
    if (!seen.has(p.id)) {
      seen.add(p.id)
      merged.push(p)
    }
  }
  return merged
})

const loadPlaces = (force = false) => {
  const v = mapView.value
  if (!v || v.zoom < MIN_POI_ZOOM) return
  overpass.fetchPlaces(v, { force })
}

const debouncedLoad = useDebounceFn(() => loadPlaces(), 700)

const handleViewChange = (view: MapView) => {
  mapView.value = view
  if (view.zoom < MIN_POI_ZOOM) {
    overpass.places.value = []
    return
  }
  debouncedLoad()
}


const uniqueCategories = computed(() => {
  const counts = new Map<string, number>()
  for (const p of currentPlaces.value) {
    if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  }
  // En kalabalık kategori önce
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat)
})

const visiblePlaces = computed(() => {
  const list = selectedCategory.value === 'all'
    ? currentPlaces.value
    : currentPlaces.value.filter(p => p.category === selectedCategory.value)
  // Seçili mekan filtre dışında kalsa bile haritada kalsın
  const sel = selectedPlace.value
  if (sel && !list.some(p => p.id === sel.id)) return [sel, ...list]
  return list
})

watch(() => uniqueCategories.value, (cats) => {
  if (selectedCategory.value !== 'all' && !cats.includes(selectedCategory.value)) {
    selectedCategory.value = 'all'
  }
})

const handlePlaceSelect = (place: Place) => {
  selectedCategory.value = 'all'

  if (isAreaCategory(place.category)) {
    // Şehir / ilçe / mahalle: sadece haritayı oraya götür, mekanlar Overpass'tan gelir
    selectedPlace.value = null
    mapCenter.value = { lat: place.latitude, lng: place.longitude, zoom: 14 }
    return
  }

  selectedPlace.value = place
  mapCenter.value = { lat: place.latitude, lng: place.longitude, zoom: 16 }
  if (!searchedPlaces.value.some(p => p.id === place.id)) {
    searchedPlaces.value = [place, ...searchedPlaces.value]
  }
}

const handleMarkerClick = (place: Place) => {
  selectedPlace.value = place
}

watch(selectedPlace, async (place) => {
  if (!place || place.address) return
  addressLoading.value = true
  const address = await reverse(place.latitude, place.longitude)
  if (selectedPlace.value?.id !== place.id) return // bu arada başka mekan seçildi
  if (address) place.address = address
  addressLoading.value = false
})

const isPlaceSaved = (id: string) => {
  return store.getPlaceById(id) !== undefined
}

const savePlace = () => {
  if (selectedPlace.value) {
    store.addPlace(selectedPlace.value)
    toast.add({
      title: 'Arşive eklendi',
      description: `${selectedPlace.value.name} artık hafızanda.`,
      color: 'success',
      icon: 'i-heroicons-bookmark-solid'
    })
  }
}
</script>
