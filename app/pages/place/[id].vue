<template>
  <UContainer class="py-8">
    <UButton to="/saved" icon="i-heroicons-arrow-left" color="gray" variant="ghost" class="mb-6">Listeye Dön</UButton>

    <div v-if="!place" class="text-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
      <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 class="text-xl font-bold mb-2">Mekan Bulunamadı</h3>
      <p class="text-gray-500 mb-6">Bu mekan silinmiş veya hiç kaydedilmemiş olabilir.</p>
      <UButton to="/saved" color="primary">Listeye Dön</UButton>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-black text-gray-900 dark:text-white mb-3">{{ place.name }}</h1>
          <div class="flex flex-wrap gap-2 mb-4">
            <UBadge color="gray" variant="soft" class="uppercase tracking-wide text-xs">{{ place.category }}</UBadge>
            <UBadge :color="place.status === 'visited' ? 'green' : 'orange'" variant="subtle" class="tracking-wide text-xs">
              {{ place.status === 'visited' ? 'Ziyaret Edildi' : 'Planlandı' }}
            </UBadge>
          </div>
          <p class="text-gray-600 dark:text-gray-400 flex items-start gap-2">
            <UIcon name="i-heroicons-map-pin" class="w-5 h-5 shrink-0 mt-0.5 text-primary" />
            {{ place.address }}
          </p>
        </div>

        <div class="h-64 rounded-xl overflow-hidden border dark:border-gray-800 shadow-sm relative z-0">
          <ClientOnly>
            <Map :center="{lat: place.latitude, lng: place.longitude}" :places="[place]" />
          </ClientOnly>
        </div>
      </div>

      <UCard class="h-max shadow-lg ring-1 ring-gray-200 dark:ring-gray-800">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-book-open" class="w-6 h-6 text-primary" />
            <h2 class="text-xl font-bold">Kişisel Hafıza</h2>
          </div>
        </template>

        <div class="space-y-8">
          <div>
            <label class="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Ziyaret Durumu</label>
            <UButton 
              v-if="place.status === 'planned'" 
              @click="markVisited" 
              color="green" 
              icon="i-heroicons-check-circle"
              block
              size="lg"
            >
              Ziyaret Edildi Olarak İşaretle
            </UButton>
            <div v-else class="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-3 border border-green-200 dark:border-green-800/30">
              <UIcon name="i-heroicons-check-badge" class="w-6 h-6" />
              <div>
                <p class="font-bold">Ziyaret Edildi</p>
                <p class="text-sm opacity-90" v-if="place.visitedAt">{{ new Date(place.visitedAt).toLocaleDateString('tr-TR') }} tarihinde</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Puanınız</label>
            <USelect 
              v-model="ratingForm" 
              :options="ratingOptions" 
              size="lg"
              @change="updateRating"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Gezi Notlarınız</label>
            <UTextarea 
              v-model="noteForm" 
              rows="5" 
              placeholder="Bu mekan nasıldı? Neler hissettiniz? Bir daha gitseniz ne yaparsınız..." 
              class="mb-3"
            />
            <UButton @click="saveNote" color="primary" block icon="i-heroicons-document-text">Notu Kaydet</UButton>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePlacesStore } from '../../stores/places'

const route = useRoute()
const store = usePlacesStore()
const toast = useToast()

const placeId = route.params.id as string

const ratingForm = ref<number | string>('')
const noteForm = ref('')

const ratingOptions = [
  { label: 'Puan Seçin', value: '' },
  { label: '1 Yıldız - Kötü', value: 1 },
  { label: '2 Yıldız - İdare Eder', value: 2 },
  { label: '3 Yıldız - Ortalama', value: 3 },
  { label: '4 Yıldız - İyi', value: 4 },
  { label: '5 Yıldız - Mükemmel', value: 5 }
]

const place = computed(() => {
  if (!store.isInitialized) return null
  return store.getPlaceById(placeId)
})

watch(() => store.isInitialized, (init) => {
  if (init && place.value) {
    if (place.value.rating) ratingForm.value = place.value.rating
    if (place.value.note) noteForm.value = place.value.note
  }
}, { immediate: true })

const markVisited = () => {
  store.markAsVisited(placeId)
  toast.add({ title: 'Tebrikler!', description: 'Mekan ziyaret edildi olarak işaretlendi.', color: 'green' })
}

const updateRating = () => {
  if (ratingForm.value !== '') {
    store.updateRating(placeId, Number(ratingForm.value))
    toast.add({ title: 'Puan Kaydedildi', description: 'Mekana verdiğiniz puan güncellendi.', color: 'primary' })
  }
}

const saveNote = () => {
  store.updateNote(placeId, noteForm.value)
  toast.add({ title: 'Not Kaydedildi', description: 'Kişisel gezi notunuz başarıyla kaydedildi.', color: 'primary' })
}
</script>