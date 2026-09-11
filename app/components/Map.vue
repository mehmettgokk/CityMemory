<template>
  <div id="map" class="w-full h-full rounded-lg shadow-inner z-0 min-h-[400px]"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import type { Place } from '~/types/place'

const props = defineProps<{
  center?: { lat: number, lng: number },
  places: Place[]
}>()

const emit = defineEmits(['place-click'])
const mapInstance = ref<any>(null)
let markers: any[] = []

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const L = (await import('leaflet')).default

    mapInstance.value = L.map('map').setView([39.92077, 32.85411], 6)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.value)

    updateMarkers(L)
  }
})

watch(() => props.center, (newCenter) => {
  if (newCenter && mapInstance.value) {
    mapInstance.value.flyTo([newCenter.lat, newCenter.lng], 13)
  }
}, { deep: true })

watch(() => props.places, () => {
  if (mapInstance.value && typeof window !== 'undefined') {
    import('leaflet').then(L => updateMarkers(L.default))
  }
}, { deep: true })

const updateMarkers = (L: any) => {
  markers.forEach(m => mapInstance.value.removeLayer(m))
  markers = []

  props.places.forEach(place => {
    const marker = L.marker([place.latitude, place.longitude])
      .addTo(mapInstance.value)
      .bindPopup(`<b>${place.name}</b><br><span class="text-xs text-gray-500 uppercase">${place.category}</span>`)
      .on('click', () => {
        emit('place-click', place)
      })
    markers.push(marker)
  })
}
</script>

<style>
.leaflet-popup-content-wrapper {
  border-radius: 8px;
}
.leaflet-popup-content {
  margin: 12px;
}
</style>