<template>
  <div ref="mapEl" class="w-full h-full min-h-[400px] z-0" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import type { Place } from '../types/place'
import { formatCategory, categoryGroup, GROUP_COLORS } from '../utils/category'
import type { BBox } from '../composables/useOverpass'

export interface MapView extends BBox {
  zoom: number
}

const props = defineProps<{
  center?: { lat: number, lng: number, zoom?: number }
  places: Place[]
  selectedId?: string
  zoom?: number
}>()

const emit = defineEmits<{
  'place-click': [place: Place]
  'view-change': [view: MapView]
}>()

const mapEl = ref<HTMLElement | null>(null)
let map: any = null
let L: any = null
let markers = new Map<string, any>()

// Kategori rengine göre SVG iğne — bundler'da kırılan varsayılan Leaflet görsellerine gerek kalmaz
const pinIcon = (place: Place, selected: boolean) => {
  const size = selected ? 42 : 28
  const fill = selected ? '#9f3f24' : GROUP_COLORS[categoryGroup(place.category)]
  return L.divIcon({
    className: 'cm-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12z" fill="${fill}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="10" r="2.6" fill="#fff"/>
    </svg>`
  })
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

const popupHtml = (place: Place) =>
  `<div style="font-weight:600;font-size:14px">${escapeHtml(place.name)}</div>` +
  `<div style="font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:${GROUP_COLORS[categoryGroup(place.category)]};margin-top:2px">${escapeHtml(formatCategory(place.category))}</div>`

const updateMarkers = () => {
  if (!map || !L) return
  const wanted = new Set(props.places.map(p => p.id))

  // Artık görünmeyenleri kaldır
  for (const [id, m] of markers) {
    if (!wanted.has(id)) {
      map.removeLayer(m)
      markers.delete(id)
    }
  }

  props.places.forEach(place => {
    const selected = place.id === props.selectedId
    const existing = markers.get(place.id)
    if (existing) {
      existing.setIcon(pinIcon(place, selected))
      existing.setZIndexOffset(selected ? 1000 : 0)
      return
    }
    const marker = L.marker([place.latitude, place.longitude], {
      icon: pinIcon(place, selected),
      zIndexOffset: selected ? 1000 : 0
    })
      .addTo(map)
      .bindPopup(popupHtml(place))
      .on('click', () => emit('place-click', place))
    markers.set(place.id, marker)
  })
}

const emitView = () => {
  if (!map) return
  const b = map.getBounds()
  emit('view-change', {
    south: b.getSouth(),
    west: b.getWest(),
    north: b.getNorth(),
    east: b.getEast(),
    zoom: map.getZoom()
  })
}

onMounted(async () => {
  if (!mapEl.value) return
  L = (await import('leaflet')).default

  const start: [number, number] = props.center ? [props.center.lat, props.center.lng] : [39.92077, 32.85411]
  map = L.map(mapEl.value, { zoomControl: true }).setView(start, props.center ? (props.center.zoom ?? props.zoom ?? 15) : 6)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map)

  map.on('moveend', emitView)
  updateMarkers()
  // Konteyner ilk render'da ölçülmemiş olabilir
  setTimeout(() => { map?.invalidateSize(); emitView() }, 150)
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})

watch(() => props.center, (c) => {
  if (c && map) map.flyTo([c.lat, c.lng], c.zoom ?? props.zoom ?? 13, { duration: 1.2 })
}, { deep: true })

watch(() => [props.places, props.selectedId], updateMarkers, { deep: true })
</script>
