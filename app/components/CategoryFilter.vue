<template>
  <div class="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]">
    <button
      type="button"
      :class="chipClass(modelValue === 'all')"
      @click="$emit('update:modelValue', 'all')"
    >
      Tümü
      <span class="ml-1.5 opacity-70 tabular-nums">{{ total }}</span>
    </button>

    <button
      v-for="cat in categories"
      :key="cat"
      type="button"
      :class="chipClass(modelValue === cat)"
      @click="$emit('update:modelValue', cat)"
    >
      {{ formatCategory(cat) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { formatCategory } from '../utils/category'

defineProps<{
  categories: string[]
  modelValue: string
  total?: number
}>()

defineEmits(['update:modelValue'])

const chipClass = (active: boolean) => [
  'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ring-1',
  active
    ? 'bg-primary text-white ring-primary shadow-sm'
    : 'bg-elevated text-toned ring-default hover:ring-accented hover:text-highlighted'
]

</script>
