import { ref } from 'vue'
import type { Place } from '../types/place'

export const useNominatim = () => {

    const searchResults = ref<Place[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)


    // API'den sonucu bizim istediğimize göre dönüştürme
    const transformToPlace = (item: any): Place => {
        return {
            id: item.place_id.toString(),
            name: item.name || (item.display_name ? item.display_name.split(',')[0] : 'Bilinmeyen Yer'),
            category: item.type || item.class || 'unknown',
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            address: item.display_name
        }
    }
    
    //  arama işlemi
    const search = async (query: string) => {
        if(!query.trim()){
            searchResults.value = []
            return
        }
    
        isLoading.value = true
        error.value = null

        try {
            const response = await $fetch<any[]>('https://nominatim.openstreetmap.org/search',{
                params: {
                    q: query,
                    format: 'json',
                    addressdetails: 1,
                    limit: 10
                },
                headers: {
                    'Accept-Language': 'tr-TR'
                }
            })

            searchResults.value = response.map(transformToPlace)
        } catch (err) {
            error.value = 'Arama yapılırken bir hata oluştu: Lütfen bağlantınızı kontrol edin'
            console.error(err)
        } finally {
            isLoading.value = false
        }
    }

    const formatAddress = (a: Record<string, string | undefined> | undefined, fallback?: string): string | undefined => {
        if (!a) return fallback
        const parts: string[] = [
            [a.road, a.house_number].filter(Boolean).join(' '),
            a.neighbourhood || a.suburb || a.quarter,
            a.city_district || a.town || a.village,
            a.city || a.province || a.state
        ].filter((v): v is string => Boolean(v))
        const unique = parts.filter((part, i) =>
            !parts.some((other, j) => i !== j && other !== part && other.includes(part))
        )
        return Array.from(new Set(unique)).join(', ') || fallback
    }

    // Koordinattan adres bulma (adres etiketi olmayan Overpass mekanları için)
    const reverse = async (lat: number, lon: number): Promise<string | undefined> => {
        try {
            const res = await $fetch<any>('https://nominatim.openstreetmap.org/reverse', {
                params: { lat, lon, format: 'json', zoom: 18, addressdetails: 1 },
                headers: { 'Accept-Language': 'tr-TR' }
            })
            return formatAddress(res?.address, res?.display_name)
        } catch (err) {
            console.warn('Reverse geocode başarısız', err)
            return undefined
        }
    }

    return {
        search,
        reverse,
        searchResults,
        isLoading,
        error
    }
}
