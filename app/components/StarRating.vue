<template>
  <div class="flex items-center gap-0.5" :class="readonly ? '' : 'cursor-pointer'" @mouseleave="hover = 0">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      :disabled="readonly"
      :aria-label="`${i} yıldız`"
      class="transition-transform disabled:cursor-default"
      :class="!readonly && 'hover:scale-110'"
      @mouseenter="!readonly && (hover = i)"
      @click="!readonly && $emit('update:modelValue', i)"
    >
      <UIcon
        :name="i <= (hover || modelValue || 0) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
        :class="[sizeClass, i <= (hover || modelValue || 0) ? 'text-amber-500' : 'text-dimmed']"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), { size: 'md' })

defineEmits(['update:modelValue'])

const hover = ref(0)
const sizeClass = computed(() => ({ sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }[props.size]))
</script>
