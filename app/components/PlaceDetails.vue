<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
    <div class="space-y-4">
      <div class="flex items-center justify-between gap-2">
        <UBadge color="gray" variant="subtle" size="sm" class="rounded-md uppercase tracking-wider font-semibold">
          {{ place.category }}
        </UBadge>

        <UBadge v-if="isSaved" color="primary" variant="subtle" size="sm" class="rounded-md font-medium">
          <UIcon name="i-heroicons-bookmark" class="w-3.5 h-3.5 mr-1" />
          Kayıtlı
        </UBadge>
      </div>

      <div>
        <h2 class="text-2xl font-extrabold text-gray-900 dark:text-white leading-snug">
          {{ place.name }}
        </h2>
      </div>

      <div class="space-y-3 pt-2">
        <div class="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
          <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <span class="leading-relaxed">{{ place.address || 'Adres detayı mevcut değil.' }}</span>
        </div>

        <div class="flex items-center gap-2.5 text-xs text-gray-400">
          <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 shrink-0" />
          <span>{{ place.latitude.toFixed(4) }}, {{ place.longitude.toFixed(4) }}</span>
        </div>
      </div>
    </div>

    <div class="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
      <UButton
        v-if="!isSaved"
        size="md"
        block
        color="primary"
        icon="i-heroicons-bookmark"
        class="rounded-xl font-bold py-2.5 shadow-sm"
        @click="$emit('save')"
      >
        Listeme Kaydet
      </UButton>

      <UButton
        v-else
        :to="`/place/${place.id}`"
        size="md"
        block
        color="gray"
        icon="i-heroicons-pencil-square"
        class="rounded-xl font-bold py-2.5"
      >
        Kişisel Notları ve Puanı Gör
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Place } from '../types/place'

defineProps<{
  place: Place
  isSaved: boolean
}>()

defineEmits(['save'])
</script>