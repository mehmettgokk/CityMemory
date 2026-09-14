<template>
  <UContainer class="py-8 lg:py-10">
    <NuxtLink to="/saved" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-highlighted transition-colors mb-6">
      <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
      Arşivime dön
    </NuxtLink>

    <div v-if="!store.isInitialized" class="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div class="lg:col-span-3 paper h-96 animate-pulse" />
      <div class="lg:col-span-2 paper h-96 animate-pulse" />
    </div>

    <div v-else-if="!place" class="paper max-w-lg mx-auto text-center px-8 py-14">
      <span class="w-16 h-16 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mx-auto mb-5">
        <UIcon name="i-heroicons-question-mark-circle" class="w-8 h-8" />
      </span>
      <h3 class="font-display text-2xl font-semibold text-highlighted">Mekan bulunamadı</h3>
      <p class="text-sm text-muted mt-2 mb-6">Bu mekan arşivinden silinmiş ya da hiç kaydedilmemiş olabilir.</p>
      <UButton to="/saved" color="primary" class="rounded-xl">Arşivime dön</UButton>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <!-- Sol: API'den gelen mekan bilgisi -->
      <section class="lg:col-span-3 space-y-6">
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="text-[11px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
              {{ formatCategory(place.category) }}
            </span>
            <UBadge
              :color="visited ? 'success' : 'warning'"
              variant="subtle"
              size="sm"
              :icon="visited ? 'i-heroicons-check-circle' : 'i-heroicons-clock'"
            >
              {{ visited ? 'Ziyaret edildi' : 'Planlandı' }}
            </UBadge>
          </div>

          <h1 class="font-display text-4xl sm:text-5xl font-semibold text-highlighted leading-[1.05]">
            {{ place.name }}
          </h1>

          <p class="text-toned mt-4 flex items-start gap-2 text-sm leading-relaxed">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4 shrink-0 mt-0.5 text-primary" />
            {{ place.address || 'Adres bilgisi bulunmuyor.' }}
          </p>
        </div>

        <div class="paper overflow-hidden h-80 relative">
          <ClientOnly>
            <Map :center="{ lat: place.latitude, lng: place.longitude }" :places="[place]" :selected-id="place.id" :zoom="15" />
          </ClientOnly>
        </div>

        <dl class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div class="paper px-4 py-3">
            <dt class="text-[11px] text-muted">Arşive eklendi</dt>
            <dd class="font-medium text-highlighted mt-0.5">{{ formatDate(place.savedAt) }}</dd>
          </div>
          <div class="paper px-4 py-3">
            <dt class="text-[11px] text-muted">Ziyaret</dt>
            <dd class="font-medium text-highlighted mt-0.5">{{ place.visitedAt ? formatDate(place.visitedAt) : '—' }}</dd>
          </div>
          <div class="paper px-4 py-3 col-span-2 sm:col-span-1">
            <dt class="text-[11px] text-muted">Koordinat</dt>
            <dd class="font-medium text-highlighted mt-0.5 tabular-nums text-xs">{{ place.latitude.toFixed(4) }}, {{ place.longitude.toFixed(4) }}</dd>
          </div>
        </dl>
      </section>

      <!-- Sağ: kullanıcının kendi verisi -->
      <aside class="lg:col-span-2 paper p-6 space-y-7 lg:sticky lg:top-24">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <UIcon name="i-heroicons-book-open" class="w-5 h-5" />
          </span>
          <div>
            <h2 class="font-display text-xl font-semibold text-highlighted leading-none">Kişisel hafıza</h2>
            <p class="text-[11px] text-muted mt-1">Sadece bu tarayıcıda saklanır</p>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">Ziyaret durumu</p>
          <UButton
            v-if="!visited"
            color="success"
            icon="i-heroicons-check-circle"
            block
            size="lg"
            class="rounded-xl"
            @click="markVisited"
          >
            Ziyaret ettim
          </UButton>
          <div v-else class="p-4 rounded-xl bg-success/10 text-success flex items-center gap-3 ring-1 ring-success/20">
            <UIcon name="i-heroicons-check-badge-solid" class="w-6 h-6 shrink-0" />
            <div>
              <p class="font-semibold text-sm">Ziyaret edildi</p>
              <p v-if="place.visitedAt" class="text-xs opacity-80">{{ formatDate(place.visitedAt) }}</p>
            </div>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">Puanım</p>
          <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted ring-1 ring-default">
            <StarRating :model-value="place.rating" size="lg" @update:model-value="updateRating" />
            <span class="text-sm text-toned font-medium">{{ ratingLabel }}</span>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">Gezi notum</p>
          <UTextarea
            v-model="noteForm"
            :rows="6"
            autoresize
            placeholder="Bu mekan nasıldı? Neler hissettin? Bir daha gitsen ne yapardın…"
            class="w-full"
            :ui="{ base: 'rounded-xl font-display text-[15px] leading-relaxed' }"
          />
          <div class="flex items-center justify-between mt-3">
            <span class="text-[11px] text-dimmed">
              {{ noteDirty ? 'Kaydedilmemiş değişiklik' : (place.note ? 'Kaydedildi' : '') }}
            </span>
            <UButton
              color="primary"
              icon="i-heroicons-pencil-square"
              :disabled="!noteDirty"
              class="rounded-xl"
              @click="saveNote"
            >
              Notu kaydet
            </UButton>
          </div>
        </div>
      </aside>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { formatCategory } from '../../utils/category'
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePlacesStore } from '../../stores/places'

const route = useRoute()
const store = usePlacesStore()
const toast = useToast()

const placeId = route.params.id as string
const noteForm = ref('')

const ratingLabels: Record<number, string> = {
  1: 'Kötü', 2: 'İdare eder', 3: 'Ortalama', 4: 'İyi', 5: 'Mükemmel'
}

const place = computed(() => {
  if (!store.isInitialized) return null
  return store.getPlaceById(placeId)
})

const visited = computed(() => place.value?.status === 'visited')
const ratingLabel = computed(() => place.value?.rating ? ratingLabels[place.value.rating] : 'Henüz puan yok')
const noteDirty = computed(() => noteForm.value !== (place.value?.note ?? ''))

watch(() => store.isInitialized, (init) => {
  if (init && place.value?.note) noteForm.value = place.value.note
}, { immediate: true })

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

const markVisited = () => {
  store.markAsVisited(placeId)
  toast.add({ title: 'Tebrikler!', description: 'Mekan ziyaret edildi olarak işaretlendi.', color: 'success', icon: 'i-heroicons-check-badge' })
}

const updateRating = (value: number) => {
  store.updateRating(placeId, value)
  toast.add({ title: 'Puan kaydedildi', description: `${value}/5 — ${ratingLabels[value]}`, color: 'primary', icon: 'i-heroicons-star' })
}

const saveNote = () => {
  store.updateNote(placeId, noteForm.value)
  toast.add({ title: 'Not kaydedildi', description: 'Gezi notun arşivine işlendi.', color: 'primary', icon: 'i-heroicons-pencil-square' })
}
</script>
