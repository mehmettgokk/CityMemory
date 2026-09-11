<template>
  <UContainer class="py-8 space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex items-center gap-4">
        <UButton to="/" icon="i-heroicons-arrow-left" color="gray" variant="ghost" />
        <h1 class="text-3xl font-bold">Kaydedilen Mekanlar</h1>
      </div>
      
      <USelect 
        v-model="filterStatus" 
        :options="filterOptions" 
        class="w-full sm:w-48"
      />
    </div>

    <div v-if="filteredPlaces.length === 0" class="text-center py-20 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg shadow-sm">
      <UIcon name="i-heroicons-map" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Mekan Bulunamadı</h3>
      <p class="text-gray-500 mt-1">Bu kriterlere uygun kaydedilmiş bir mekanınız yok.</p>
      <UButton to="/" color="primary" class="mt-4">Yeni Mekan Keşfet</UButton>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="place in filteredPlaces" :key="place.id" class="flex flex-col h-full">
        <template #header>
          <div class="flex justify-between items-start gap-2">
            <div>
              <h3 class="text-lg font-bold line-clamp-1" :title="place.name">{{ place.name }}</h3>
              <span class="text-xs text-gray-500 uppercase">{{ place.category }}</span>
            </div>
            <UBadge :color="place.status === 'visited' ? 'green' : 'orange'" variant="subtle" class="shrink-0">
              {{ place.status === 'visited' ? 'Ziyaret Edildi' : 'Planlandı' }}
            </UBadge>
          </div>
        </template>
        
        <div class="flex-grow">
          <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4" :title="place.address">
            {{ place.address }}
          </p>
          
          <div v-if="place.rating" class="flex items-center gap-1 text-yellow-500 mb-3">
            <UIcon name="i-heroicons-star-solid" v-for="i in place.rating" :key="i" class="w-4 h-4" />
          </div>
          
          <p v-if="place.note" class="text-sm italic text-gray-500 border-l-2 border-gray-300 dark:border-gray-700 pl-2 line-clamp-2">
            "{{ place.note }}"
          </p>
        </div>

        <template #footer>
          <div class="flex justify-between w-full gap-2 mt-auto">
            <UButton :to="`/place/${place.id}`" color="gray" block class="flex-1">Detaylar / Notlar</UButton>
            <UButton @click="removePlace(place.id)" color="red" variant="soft" icon="i-heroicons-trash" />
          </div>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlacesStore } from '../stores/places'

const store = usePlacesStore()
const filterStatus = ref('all')

const filterOptions = [
  { label: 'Tümü', value: 'all' },
  { label: 'Planlananlar', value: 'planned' },
  { label: 'Ziyaret Edilenler', value: 'visited' }
]

const filteredPlaces = computed(() => {
  if (!store.isInitialized) return []
  if (filterStatus.value === 'all') return store.savedPlaces
  return store.savedPlaces.filter(p => p.status === filterStatus.value)
})

const removePlace = (id: string) => {
  if (confirm('Bu mekanı listenizden çıkarmak istediğinize emin misiniz?')) {
    store.removePlace(id)
  }
}
</script>