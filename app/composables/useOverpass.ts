import { ref } from 'vue'
import type { Place } from '../types/place'

export interface BBox {
  south: number
  west: number
  north: number
  east: number
}

// Kullanıcıya "ilgi çekici" gelmeyecek etiketler (konaklama, bilgi tabelası vb.)
const EXCLUDED = new Set(['hostel', 'guest_house', 'apartment', 'motel', 'chalet', 'camp_pitch', 'caravan_site', 'information', 'yes'])

// Ana sunucu yoğunken (504) sırayla yedek sunucular denenir
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
]

export const useOverpass = () => {
  const places = ref<Place[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let controller: AbortController | null = null

  const buildQuery = ({ south, west, north, east }: BBox) => {
    const bbox = `${south},${west},${north},${east}`
    // nw (node+way): relation'ları dışarıda bırakmak sorguyu belirgin biçimde hafifletir
    return `[out:json][timeout:20][maxsize:16777216];
(
  nw["tourism"]["name"](${bbox});
  nw["historic"]["name"](${bbox});
  nw["amenity"~"^(cafe|restaurant|bar|pub|theatre|cinema|library|place_of_worship|marketplace|arts_centre|community_centre)$"]["name"](${bbox});
  nw["leisure"~"^(park|garden|nature_reserve|beach_resort)$"]["name"](${bbox});
);
out center 250;`
  }

  const buildAddress = (tags: Record<string, string>) => {
    const parts = [
      [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' '),
      tags['addr:neighbourhood'] || tags['addr:suburb'],
      tags['addr:district'],
      tags['addr:city'] || tags['addr:town']
    ].filter(Boolean)
    return parts.length ? parts.join(', ') : undefined
  }

  // Overpass elemanını uygulamanın Place modeline dönüştürür
  const transformToPlace = (el: any): Place | null => {
    const tags: Record<string, string> = el.tags ?? {}
    const lat = el.lat ?? el.center?.lat
    const lon = el.lon ?? el.center?.lon
    if (lat == null || lon == null || !tags.name) return null

    // Öncelik: tourism > historic > amenity > leisure; historic=yes gibi anlamsız değerler atlanır
    const candidates = [tags.tourism, tags.historic, tags.amenity, tags.leisure].filter(v => v && !EXCLUDED.has(v))
    let category = candidates[0]
    if (!category) {
      if (tags.historic) category = 'historic'
      else return null
    }
    if (category === 'place_of_worship' && tags.religion === 'muslim') category = 'mosque'
    if (category === 'place_of_worship' && tags.religion === 'christian') category = 'church'

    return {
      // '/' kullanılmaz: /place/[id] rotasında ayırıcı olarak algılanırdı
      id: `${el.type}-${el.id}`,
      name: tags.name,
      category,
      latitude: lat,
      longitude: lon,
      address: buildAddress(tags)
    }
  }

  const fetchPlaces = async (bbox: BBox) => {
    controller?.abort()
    const ctrl = new AbortController()
    controller = ctrl
    isLoading.value = true
    error.value = null

    const body = new URLSearchParams({ data: buildQuery(bbox) })
    let lastError: any = null

    try {
      for (const url of OVERPASS_ENDPOINTS) {
        if (ctrl.signal.aborted) return
        try {
          const response = await $fetch<{ elements: any[] }>(url, {
            method: 'POST',
            body,
            signal: ctrl.signal,
            timeout: 30000
          })
          places.value = response.elements
            .map(transformToPlace)
            .filter((p): p is Place => p !== null)
          return
        } catch (err: any) {
          if (err?.name === 'AbortError' || ctrl.signal.aborted) return
          lastError = err
          console.warn(`Overpass başarısız (${url}), sıradaki sunucu deneniyor`, err?.status ?? err?.message)
        }
      }
      error.value = 'Mekanlar yüklenemedi. Overpass servisi şu an yoğun; biraz sonra tekrar deneyin.'
      console.error(lastError)
    } finally {
      if (!ctrl.signal.aborted) isLoading.value = false
    }
  }

  return { places, isLoading, error, fetchPlaces }
}
