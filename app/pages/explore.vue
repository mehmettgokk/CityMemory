<template>
  <UContainer class="py-8 space-y-6">
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">Şehir Hafızası</h1>
        <p class="text-gray-500">Keşfet, kaydet, kişisel gezi arşivini oluştur.</p>
      </div>
      <div class="flex items-center gap-4">
        <ThemeToggle />
        <UButton to="/saved" icon="i-heroicons-bookmark" color="black">Kaydedilenler</UButton>
      </div>
    </div>

    <SearchInput @select="handlePlaceSelect" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
      <div class="lg:col-span-2 relative border dark:border-gray-800 rounded-lg overflow-hidden z-0">
        <ClientOnly fallback-tag="div" fallback="Harita Yükleniyor...">
          <Map :center="mapCenter" :places="currentPlaces" @place-click="handleMarkerClick" />
        </ClientOnly>
      </div>

      <div class="lg:col-span-1 z-0">
        <UCard v-if="selectedPlace" class="h-full flex flex-col">
          <template #header>
            <h3 class="text-xl font-bold">{{ selectedPlace.name }}</h3>
            <span class="inline-block mt-2 text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 px-2 py-1 rounded-full uppercase">
              {{ selectedPlace.category }}
            </span>
          </template>
          
          <div class="space-y-4 flex-grow">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <UIcon name="i-heroicons-map-pin" class="inline-block w-4 h-4 mr-1 align-text-bottom" />
              {{ selectedPlace.address }}
            </p>
          </div>

          <template #footer>
            <div class="flex gap-2 w-full">
              <UButton 
                v-if="!isPlaceSaved(selectedPlace.id)" 
                @click="savePlace" 
                block 
                color="primary"
                icon="i-heroicons-bookmark"
              >
                Listeme Ekle
              </UButton>
              <UButton 
                v-else 
                :to="`/place/${selectedPlace.id}`" 
                block 
                color="gray"
                icon="i-heroicons-pencil-square"
              >
                Notları Düzenle
              </UButton>
            </div>
          </template>
        </UCard>
        
        <UCard v-else class="h-full flex items-center justify-center text-center text-gray-500">
          Haritadan bir mekan seçin veya arama yapın.
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Place } from '../types/place'

const store = usePlacesStore()
const toast = useToast()

const selectedPlace = ref<Place | null>(null)
const currentPlaces = ref<Place[]>([]) 
const mapCenter = ref<{lat: number, lng: number} | undefined>(undefined)

const handlePlaceSelect = (place: Place) => {
  selectedPlace.value = place
  mapCenter.value = { lat: place.latitude, lng: place.longitude }
  currentPlaces.value = [place]
}

const handleMarkerClick = (place: Place) => {
  selectedPlace.value = place
}

const isPlaceSaved = (id: string) => {
  return store.getPlaceById(id) !== undefined
}

const savePlace = () => {
  if (selectedPlace.value) {
    store.addPlace(selectedPlace.value)
    toast.add({ title: 'Başarılı!', description: 'Mekan listenize eklendi.', color: 'green' })
  }
}
</script>