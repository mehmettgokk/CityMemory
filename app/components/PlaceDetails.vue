<template>
  <div class="paper p-6 flex flex-col h-full">
    <div class="flex items-center justify-between gap-2">
      <span class="text-[11px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
        {{ formatCategory(place.category) }}
      </span>
      <UBadge v-if="isSaved" color="success" variant="subtle" size="sm" icon="i-heroicons-bookmark-solid">
        Arşivde
      </UBadge>
    </div>

    <h2 class="font-display text-2xl font-semibold text-highlighted leading-tight mt-4">
      {{ place.name }}
    </h2>

    <dl class="mt-5 space-y-3 text-sm">
      <div class="flex items-start gap-2.5">
        <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <dd class="text-toned leading-relaxed">
          <template v-if="place.address">{{ place.address }}</template>
          <span v-else-if="addressLoading" class="text-muted flex items-center gap-1.5">
            <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" /> Adres bulunuyor…
          </span>
          <span v-else class="text-muted">Adres bilgisi bulunamadı.</span>
        </dd>
      </div>
      <div class="flex items-center gap-2.5 text-muted">
        <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 shrink-0" />
        <dd class="tabular-nums text-xs">{{ place.latitude.toFixed(5) }}, {{ place.longitude.toFixed(5) }}</dd>
      </div>
    </dl>

    <div class="flex-1" />

    <div class="pt-6 mt-6 border-t border-default space-y-2">
      <UButton
        v-if="!isSaved"
        size="lg"
        block
        color="primary"
        icon="i-heroicons-bookmark"
        class="rounded-xl"
        @click="$emit('save')"
      >
        Arşivime Ekle
      </UButton>
      <template v-else>
        <UButton
          :to="`/place/${place.id}`"
          size="lg"
          block
          color="neutral"
          variant="soft"
          icon="i-heroicons-pencil-square"
          class="rounded-xl"
        >
          Not ve Puan Ekle
        </UButton>
      </template>
      <p class="text-[11px] text-dimmed text-center pt-1">
        {{ isSaved ? 'Bu mekan arşivinde kayıtlı.' : 'Kaydettikten sonra puan verip not yazabilirsin.' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCategory } from '../utils/category'
import type { Place } from '../types/place'

defineProps<{
  place: Place
  isSaved: boolean
  addressLoading?: boolean
}>()

defineEmits(['save'])
</script>
