import { ref } from 'vue'
import type { Place } from '../types/place'

export interface BBox {
  south: number
  west: number
  north: number
  east: number
}


const EXCLUDED = new Set(['hostel', 'guest_house', 'apartment', 'motel', 'chalet', 'camp_pitch', 'caravan_site', 'information', 'yes'])


const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
]
const HEDGE_DELAY_MS = 2500
const REQUEST_TIMEOUT_MS = 25000
const SLOW_NOTICE_MS = 6000


const BBOX_PADDING = 0.35

export const useOverpass = () => {
  const places = ref<Place[]>([])
  const isLoading = ref(false)
  const isSlow = ref(false)
  const error = ref<string | null>(null)

  let controller: AbortController | null = null
  let fetchedBBox: BBox | null = null

  const buildQuery = ({ south, west, north, east }: BBox) => {
    const bbox = `${south.toFixed(5)},${west.toFixed(5)},${north.toFixed(5)},${east.toFixed(5)}`
    return `[out:json][timeout:15][maxsize:16777216];
(
  nw["tourism"]["name"](${bbox});
  nw["historic"]["name"](${bbox});
  nw["amenity"~"^(cafe|restaurant|bar|pub|theatre|cinema|library|place_of_worship|marketplace|arts_centre|community_centre)$"]["name"](${bbox});
  nw["leisure"~"^(park|garden|nature_reserve|beach_resort)$"]["name"](${bbox});
);
out center 300;`
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

  const transformToPlace = (el: any): Place | null => {
    const tags: Record<string, string> = el.tags ?? {}
    const lat = el.lat ?? el.center?.lat
    const lon = el.lon ?? el.center?.lon
    if (lat == null || lon == null || !tags.name) return null

    const candidates = [tags.tourism, tags.historic, tags.amenity, tags.leisure].filter(v => v && !EXCLUDED.has(v))
    let category = candidates[0]
    if (!category) {
      if (tags.historic) category = 'historic'
      else return null
    }
    if (category === 'place_of_worship' && tags.religion === 'muslim') category = 'mosque'
    if (category === 'place_of_worship' && tags.religion === 'christian') category = 'church'

    return {
      id: `${el.type}-${el.id}`,
      name: tags.name,
      category,
      latitude: lat,
      longitude: lon,
      address: buildAddress(tags)
    }
  }

  const padBBox = (b: BBox): BBox => {
    const dLat = (b.north - b.south) * BBOX_PADDING
    const dLng = (b.east - b.west) * BBOX_PADDING
    return { south: b.south - dLat, north: b.north + dLat, west: b.west - dLng, east: b.east + dLng }
  }

  const contains = (outer: BBox, inner: BBox) =>
    inner.south >= outer.south && inner.north <= outer.north && inner.west >= outer.west && inner.east <= outer.east

  const requestFrom = (url: string, body: URLSearchParams, signal: AbortSignal) =>
    $fetch<{ elements: any[] }>(url, { method: 'POST', body, signal, timeout: REQUEST_TIMEOUT_MS })


  const hedgedRequest = (body: URLSearchParams, parent: AbortSignal) =>
    new Promise<{ elements: any[] }>((resolve, reject) => {
      const local = new AbortController()
      parent.addEventListener('abort', () => local.abort(), { once: true })

      let nextIndex = 0
      let pending = 0
      let lastError: any = null
      let timer: ReturnType<typeof setTimeout> | undefined

      const settleIfDone = () => {
        if (pending === 0 && nextIndex >= OVERPASS_ENDPOINTS.length && !local.signal.aborted) {
          reject(lastError ?? new Error('Overpass yanıt vermedi'))
        }
      }

      const startNext = () => {
        clearTimeout(timer)
        if (local.signal.aborted) return
        if (nextIndex >= OVERPASS_ENDPOINTS.length) return settleIfDone()

        const url = OVERPASS_ENDPOINTS[nextIndex++]!
        pending++
        requestFrom(url, body, local.signal)
          .then((res) => {
            local.abort()
            resolve(res)
          })
          .catch((err) => {
            if (local.signal.aborted) return
            lastError = err
            console.warn(`Overpass başarısız (${url})`, err?.status ?? err?.message)
            pending--
            startNext() 
          })
          .then(() => {

          })

        timer = setTimeout(startNext, HEDGE_DELAY_MS)
      }

      local.signal.addEventListener('abort', () => clearTimeout(timer), { once: true })
      startNext()
    })

  const fetchPlaces = async (view: BBox, { force = false } = {}) => {
    if (!force && fetchedBBox && contains(fetchedBBox, view)) return

    controller?.abort()
    const ctrl = new AbortController()
    controller = ctrl

    isLoading.value = true
    isSlow.value = false
    error.value = null
    const slowTimer = setTimeout(() => { isSlow.value = true }, SLOW_NOTICE_MS)

    const target = padBBox(view)
    const body = new URLSearchParams({ data: buildQuery(target) })

    try {
      const response = await hedgedRequest(body, ctrl.signal)
      if (ctrl.signal.aborted) return
      places.value = response.elements
        .map(transformToPlace)
        .filter((p): p is Place => p !== null)
      fetchedBBox = target
    } catch (err: any) {
      if (ctrl.signal.aborted) return
      error.value = 'Mekanlar yüklenemedi. Overpass sunucuları şu an yoğun; biraz sonra tekrar deneyin.'
      console.error(err)
    } finally {
      clearTimeout(slowTimer)
      if (!ctrl.signal.aborted) {
        isLoading.value = false
        isSlow.value = false
      }
    }
  }

  return { places, isLoading, isSlow, error, fetchPlaces }
}
