<template>
  <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
    <UButton
      size="sm"
      :variant="modelValue === 'all' ? 'solid' : 'soft'"
      :color="modelValue === 'all' ? 'primary' : 'gray'"
      class="rounded-full px-4 text-xs font-semibold shrink-0"
      @click="$emit('update:modelValue', 'all')"
    >
      Tümü
    </UButton>

    <UButton
      v-for="cat in categories"
      :key="cat"
      size="sm"
      :variant="modelValue === cat ? 'solid' : 'soft'"
      :color="modelValue === cat ? 'primary' : 'gray'"
      class="rounded-full px-4 text-xs font-semibold shrink-0 capitalize"
      @click="$emit('update:modelValue', cat)"
    >
      {{ formatCategory(cat) }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categories: string[]
  modelValue: string
}>()

defineEmits(['update:modelValue'])

const formatCategory = (cat: string) => {
  return cat.replace(/_/g, ' ')
}
</script>