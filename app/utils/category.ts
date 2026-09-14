// OSM etiket değerlerini kullanıcıya gösterilecek Türkçe etikete çevirir.
// Veri modelinde ham OSM değeri korunur; bu yalnızca görüntüleme içindir.
const LABELS: Record<string, string> = {
  museum: 'Müze',
  gallery: 'Galeri',
  attraction: 'Gezilecek yer',
  viewpoint: 'Seyir noktası',
  artwork: 'Sanat eseri',
  theme_park: 'Eğlence parkı',
  zoo: 'Hayvanat bahçesi',
  aquarium: 'Akvaryum',
  picnic_site: 'Piknik alanı',
  hotel: 'Otel',
  monument: 'Anıt',
  memorial: 'Anıt',
  castle: 'Kale',
  ruins: 'Kalıntı',
  archaeological_site: 'Arkeolojik alan',
  tomb: 'Türbe',
  fort: 'Kale',
  city_gate: 'Şehir kapısı',
  tower: 'Kule',
  historic: 'Tarihi yer',
  cafe: 'Kafe',
  restaurant: 'Restoran',
  bar: 'Bar',
  pub: 'Pub',
  fast_food: 'Fast food',
  ice_cream: 'Dondurma',
  theatre: 'Tiyatro',
  cinema: 'Sinema',
  library: 'Kütüphane',
  place_of_worship: 'İbadet yeri',
  mosque: 'Cami',
  church: 'Kilise',
  synagogue: 'Sinagog',
  marketplace: 'Pazar',
  arts_centre: 'Sanat merkezi',
  community_centre: 'Kültür merkezi',
  park: 'Park',
  garden: 'Bahçe',
  nature_reserve: 'Doğa koruma alanı',
  beach_resort: 'Plaj',
  city: 'Şehir',
  town: 'İlçe',
  village: 'Köy',
  suburb: 'Semt',
  neighbourhood: 'Mahalle',
  administrative: 'İdari bölge',
  unknown: 'Diğer'
}

export const formatCategory = (cat: string): string =>
  LABELS[cat] ?? cat.replace(/_/g, ' ')

// Harita iğnesi rengi için kategori grubu
export type CategoryGroup = 'culture' | 'food' | 'nature' | 'worship' | 'stay' | 'other'

const GROUPS: Record<CategoryGroup, string[]> = {
  culture: ['museum', 'gallery', 'attraction', 'viewpoint', 'artwork', 'monument', 'memorial', 'castle', 'ruins', 'archaeological_site', 'tomb', 'fort', 'city_gate', 'tower', 'historic', 'theatre', 'cinema', 'library', 'arts_centre', 'community_centre', 'theme_park', 'zoo', 'aquarium'],
  food: ['cafe', 'restaurant', 'bar', 'pub', 'fast_food', 'ice_cream', 'marketplace'],
  nature: ['park', 'garden', 'nature_reserve', 'beach_resort', 'picnic_site'],
  worship: ['place_of_worship', 'mosque', 'church', 'synagogue'],
  stay: ['hotel'],
  other: []
}

export const categoryGroup = (cat: string): CategoryGroup =>
  (Object.keys(GROUPS) as CategoryGroup[]).find(g => GROUPS[g].includes(cat)) ?? 'other'

export const GROUP_COLORS: Record<CategoryGroup, string> = {
  culture: '#d6673d',
  food: '#d99a2b',
  nature: '#4f9a5e',
  worship: '#5b7fb5',
  stay: '#8a6fb0',
  other: '#8b8279'
}

// Nominatim'in "alan" tipi sonuçları: haritayı oraya götürürüz ama iğne olarak eklemeyiz
const AREA_TYPES = ['city', 'town', 'village', 'hamlet', 'suburb', 'neighbourhood', 'quarter', 'administrative', 'county', 'state', 'province', 'district', 'municipality', 'region', 'country', 'island', 'postcode', 'residential']

export const isAreaCategory = (cat: string) => AREA_TYPES.includes(cat)
