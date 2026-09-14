<template>
  <div class="flex items-center gap-0.5" @mouseleave="hover = 0">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      :disabled="readonly"
      :aria-label="`${i} yıldız`"
      :aria-pressed="!readonly && modelValue === i"
      class="disabled:cursor-default transition-transform"
      :class="!readonly && 'cursor-pointer hover:scale-110'"
      @mouseenter="onEnter(i)"
      @click="onSelect(i)"
    >
      <!-- Inline SVG: hover'da element değişmez, yalnızca sınıflar değişir -->
      <svg
        :class="[sizeClass, i <= shown ? 'text-amber-500' : 'text-dimmed']"
        class="pointer-events-none transition-colors"
        viewBox="0 0 24 24"
        :fill="i <= shown ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11a.56.56 0 0 0 .47.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 0 0-.18.56l1.28 5.38a.56.56 0 0 1-.84.61l-4.73-2.89a.56.56 0 0 0-.58 0l-4.73 2.89a.56.56 0 0 1-.84-.61l1.28-5.38a.56.56 0 0 0-.18-.56l-4.2-3.6a.56.56 0 0 1 .32-.99l5.52-.44a.56.56 0 0 0 .47-.35l2.13-5.11Z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), { size: 'md', readonly: false })

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hover = ref(0)
const shown = computed(() => hover.value || props.modelValue || 0)
const sizeClass = computed(() => ({ sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }[props.size]))

const onEnter = (i: number) => { if (!props.readonly) hover.value = i }
const onSelect = (i: number) => { if (!props.readonly) emit('update:modelValue', i) }
</script>
