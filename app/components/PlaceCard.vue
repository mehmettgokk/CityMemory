<template>
  <article class="paper p-5 flex flex-col h-full group hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(60,40,20,0.06),0_16px_32px_-16px_rgba(60,40,20,0.25)] transition-all">
    <div class="flex items-start justify-between gap-3">
      <span class="text-[11px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
        {{ formatCategory(place.category) }}
      </span>

      <UBadge
        :color="visited ? 'success' : 'warning'"
        variant="subtle"
        size="sm"
        :icon="visited ? 'i-heroicons-check-circle' : 'i-heroicons-clock'"
        class="shrink-0"
      >
        {{ visited ? 'Ziyaret edildi' : 'Planlandı' }}
      </UBadge>
    </div>

    <NuxtLink :to="`/place/${place.id}`" class="block mt-3">
      <h3 class="font-display text-xl font-semibold text-highlighted leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {{ place.name }}
      </h3>
    </NuxtLink>

    <p class="text-xs text-muted line-clamp-2 mt-1.5 leading-relaxed">
      {{ place.address || 'Adres bilgisi bulunmuyor.' }}
    </p>

    <div class="mt-4 space-y-3">
      <div v-if="place.rating" class="flex items-center gap-2">
        <StarRating :model-value="place.rating" readonly size="sm" />
        <span class="text-xs font-semibold text-toned">{{ place.rating }}/5</span>
      </div>

      <blockquote
        v-if="place.note"
        class="relative text-sm text-toned italic leading-relaxed pl-4 border-l-2 border-primary/50 line-clamp-3 font-display"
      >
        {{ place.note }}
      </blockquote>
    </div>

    <div class="flex-1" />

    <div class="pt-4 mt-4 border-t border-default flex items-center justify-between gap-2">
      <span class="text-[11px] text-dimmed flex items-center gap-1">
        <UIcon :name="visited ? 'i-heroicons-calendar-days' : 'i-heroicons-bookmark'" class="w-3.5 h-3.5" />
        {{ visited && place.visitedAt ? formatDate(place.visitedAt) : formatDate(place.savedAt) }}
      </span>

      <div class="flex items-center gap-1">
        <UButton
          :to="`/place/${place.id}`"
          size="sm"
          color="neutral"
          variant="ghost"
          trailing-icon="i-heroicons-arrow-right"
        >
          Detay
        </UButton>
        <UButton
          size="sm"
          color="error"
          variant="ghost"
          icon="i-heroicons-trash"
          aria-label="Arşivden kaldır"
          @click="$emit('delete', place.id)"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { formatCategory } from '../utils/category'
import { computed } from 'vue'
import type { SavedPlace } from '../types/place'

const props = defineProps<{
  place: SavedPlace
}>()

defineEmits(['delete'])

const visited = computed(() => props.place.status === 'visited')

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
</script>
