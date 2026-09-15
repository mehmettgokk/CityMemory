<template>
  <div ref="root" class="relative w-full z-20">
    <UInput
      v-model="query"
      icon="i-heroicons-magnifying-glass-20-solid"
      size="xl"
      placeholder="Şehir, ilçe, mahalle veya mekan ara…"
      :loading="isLoading"
      class="w-full"
      :ui="{ base: 'rounded-2xl shadow-[0_2px_10px_-4px_rgba(60,40,20,0.15)] ring-default bg-elevated pr-10', leadingIcon: 'text-primary' }"
      @focus="onFocus"
      @keydown.enter.prevent="searchNow"
      @keydown.escape="showResults = false"
    >
      <template v-if="query" #trailing>
        <UButton
          icon="i-heroicons-x-mark-20-solid"
          color="neutral"
          variant="link"
          size="sm"
          aria-label="Temizle"
          @click="clear"
        />
      </template>
    </UInput>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="showResults && (searchResults.length > 0 || error || noResults)"
        class="absolute top-full mt-2 left-0 w-full paper overflow-hidden"
      >
        <div v-if="error" class="p-4 flex items-start gap-3 text-sm text-error">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 shrink-0" />
          <span>{{ error }}</span>
        </div>

        <div v-else-if="noResults" class="p-6 text-center">
          <UIcon name="i-heroicons-map" class="w-8 h-8 text-dimmed mx-auto mb-2" />
          <p class="text-sm font-medium text-toned">"{{ query }}" için sonuç bulunamadı</p>
          <p class="text-xs text-muted mt-1">Yazımı kontrol edin ya da daha genel bir arama deneyin.</p>
        </div>

        <ul v-else class="max-h-80 overflow-y-auto py-1.5" role="listbox">
          <li
            v-for="place in searchResults"
            :key="place.id"
            role="option"
            class="px-4 py-2.5 cursor-pointer hover:bg-muted transition-colors flex items-start gap-3"
            @click="selectResult(place)"
          >
            <span class="mt-0.5 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2">
                <span class="font-semibold text-sm text-highlighted truncate">{{ place.name }}</span>
                <span class="text-[10px] uppercase tracking-wider font-semibold text-muted bg-muted px-1.5 py-0.5 rounded shrink-0">
                  {{ formatCategory(place.category) }}
                </span>
              </span>
              <span class="block text-xs text-muted truncate mt-0.5">{{ place.address }}</span>
            </span>
          </li>
        </ul>

        <div class="px-4 py-2 border-t border-default text-[10px] text-dimmed">
          Arama: Nominatim · © OpenStreetMap
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { formatCategory } from '../utils/category'
import { ref, computed, watch } from 'vue'
import { useDebounceFn, onClickOutside } from '@vueuse/core'
import type { Place } from '../types/place'

const emit = defineEmits(['select'])
const { search, searchResults, isLoading, error } = useNominatim()

const root = ref<HTMLElement | null>(null)
const query = ref('')
const showResults = ref(false)
const hasSearched = ref(false)

const noResults = computed(() =>
  hasSearched.value && !isLoading.value && query.value.length > 2 && searchResults.value.length === 0
)

const runSearch = async () => {
  const val = query.value
  if (val.trim().length > 2) {
    await search(val)
    hasSearched.value = true
    showResults.value = true
  } else {
    searchResults.value = []
    hasSearched.value = false
    showResults.value = false
  }
}

const debouncedSearch = useDebounceFn(runSearch, 500)

watch(query, (val, old) => {
  if (val === old) return
  hasSearched.value = false
  debouncedSearch()
})
const searchNow = () => runSearch()
const onFocus = () => { if (searchResults.value.length) showResults.value = true }

const clear = () => {
  query.value = ''
  searchResults.value = []
  hasSearched.value = false
  showResults.value = false
}

const selectResult = (place: Place) => {
  showResults.value = false
  query.value = place.name
  emit('select', place)
}

onClickOutside(root, () => { showResults.value = false })
</script>
