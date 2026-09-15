# Şehir Hafızası

Bir şehirdeki ilgi çekici yerleri keşfedip kendi gezi listeni oluşturabildiği bir web uygulaması.
Kaydettiğin yerler, verdiğin puanlar ve yazdığın notlar tarayıcının localStorage'ında tutulur; hesap veya backend gerekmez.

## Özellikler

- Şehir, ilçe veya adres arama (Nominatim)
- Harita üzerinde bölgedeki mekanları görme (Overpass, gerçek OSM etiketleri)
- Mekanları kategoriye göre filtreleme
- Mekan kaydetme, ziyaret edildi işaretleme, puan verme, not ekleme, listeden kaldırma
- Kaydedilenler sayfasında planlanan / ziyaret edilen filtresi
- Mekan detay sayfası
- Açık / koyu tema

## Kullanılan teknolojiler

- Framework: Nuxt 4 (Vue 3, TypeScript)
- UI: Nuxt UI, Tailwind CSS
- State: Pinia
- Harita: Leaflet, OpenStreetMap
- Arama: Nominatim API
- Mekan verisi: Overpass API
- Depolama: localStorage

## Kurulum

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

```bash
npm run build 
npx nuxt typecheck  
```

## Proje yapısı

```
app/
├── pages/
│   ├── index.vue          # landing
│   ├── explore.vue        # arama + harita
│   ├── saved.vue          # kaydedilen mekanlar
│   └── place/[id].vue     # mekan detayı
├── components/
│   ├── Map.vue
│   ├── SearchInput.vue
│   ├── CategoryFilter.vue
│   ├── PlaceDetails.vue
│   ├── PlaceCard.vue
│   ├── StarRating.vue
│   ├── Reveal.vue
│   └── ThemeToggle.vue
├── composables/
│   ├── useNominatim.ts    # arama ve adres bulma
│   └── useOverpass.ts     # bölgedeki mekanlar
├── stores/places.ts       # Pinia store, localStorage
├── types/place.ts
├── utils/category.ts      # OSM etiketi → Türkçe etiket
├── layouts/default.vue
└── assets/css/main.css
```

API'den gelen veri doğrudan component'lerde kullanılmaz; composable'lar veriyi `Place` modeline çevirir.
localStorage işlemleri yalnızca store içinde ve client tarafında yapılır.

## Veri modeli

```ts
interface Place {
  id: string
  name: string
  category: string
  latitude: number
  longitude: number
  address?: string
}

interface SavedPlace extends Place {
  status: 'planned' | 'visited'
  rating?: number
  note?: string
  savedAt: string
  visitedAt?: string
}
```

