<template>
  <div class="relative w-full z-10">
    <UInput
      v-model="query"
      icon="i-heroicons-magnifying-glass-20-solid"
      size="lg"
      placeholder="Şehir, ilçe veya mekan ara..."
      :loading="isLoading"
      @input="onInput"
      clearable
    />
    
    <div v-if="error" class="mt-2 text-red-500 text-sm">{{ error }}</div>
    
    <UCard v-if="searchResults.length > 0 && showResults" class="absolute top-12 left-0 w-full max-h-60 overflow-y-auto z-50">
      <ul class="space-y-2">
        <li 
          v-for="place in searchResults" 
          :key="place.id"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded text-sm transition-colors"
          @click="selectResult(place)"
        >
          <div class="font-semibold">{{ place.name }}</div>
          <div class="text-xs text-gray-500 truncate">{{ place.address }}</div>
        </li>
      </ul>
    </UCard>
    
    <div v-else-if="query.length > 2 && !isLoading && searchResults.length === 0" class="absolute top-12 left-0 w-full z-50 bg-white p-4 shadow rounded-md dark:bg-gray-900 border dark:border-gray-800">
      <span class="text-sm text-gray-500">Sonuç bulunamadı.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { Place } from '~/types/place'

const emit = defineEmits(['select'])
const { search, searchResults, isLoading, error } = useNominatim()

const query = ref('')
const showResults = ref(false)

const debouncedSearch = useDebounceFn(async (val: string) => {
  if (val.length > 2) {
    await search(val)
    showResults.value = true
  } else {
    searchResults.value = []
    showResults.value = false
  }
}, 500)

const onInput = () => {
  debouncedSearch(query.value)
}

const selectResult = (place: Place) => {
  showResults.value = false
  query.value = place.name
  emit('select', place)
}
</script>