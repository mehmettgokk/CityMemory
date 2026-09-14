<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group">
    <div>
      <div class="flex items-start justify-between gap-3 mb-3">
        <UBadge color="gray" variant="subtle" size="xs" class="rounded-md uppercase tracking-wider font-semibold">
          {{ place.category }}
        </UBadge>

        <UBadge
          :color="place.status === 'visited' ? 'green' : 'orange'"
          variant="subtle"
          size="xs"
          class="rounded-md font-medium shrink-0"
        >
          <UIcon :name="place.status === 'visited' ? 'i-heroicons-check-circle' : 'i-heroicons-clock'" class="w-3.5 h-3.5 mr-1" />
          {{ place.status === 'visited' ? 'Ziyaret Edildi' : 'Planlandı' }}
        </UBadge>
      </div>

      <h3 class="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-1.5 group-hover:text-primary transition-colors">
        {{ place.name }}
      </h3>

      <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
        {{ place.address || 'Adres bilgisi bulunmuyor.' }}
      </p>

      <div v-if="place.rating" class="flex items-center gap-1 mb-3 text-amber-500">
        <UIcon name="i-heroicons-star-solid" v-for="i in place.rating" :key="i" class="w-4 h-4" />
        <span class="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">{{ place.rating }}.0</span>
      </div>

      <div v-if="place.note" class="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 text-xs italic text-gray-600 dark:text-gray-300 border-l-2 border-primary mb-4 line-clamp-2">
        "{{ place.note }}"
      </div>
    </div>

    <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
      <UButton
        :to="`/place/${place.id}`"
        size="sm"
        color="gray"
        variant="ghost"
        class="flex-1 font-semibold text-xs justify-center"
      >
        Detaylar & Notlar
      </UButton>

      <UButton
        size="sm"
        color="red"
        variant="ghost"
        icon="i-heroicons-trash"
        class="shrink-0"
        @click="$emit('delete', place.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SavedPlace } from '../types/place'

defineProps<{
  place: SavedPlace
}>()

defineEmits(['delete'])
</script>