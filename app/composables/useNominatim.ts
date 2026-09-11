import { ref } from 'vue'
import type { Place } from '~/types/place'

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
                    addressdetais: 1,
                    limit: 10
                },
                headers: {
                    'Accept-Language': 'tr-TR'
                }
            })

          searchResults.value = response.map(transformToPlace)
        } catch(err){
          error.value = 'Arama yapılırken bir hata oluştu: Lütfen bağlantınızı kontrol edin'
          console.error(err)
        } finally {
            isLoading.value = false
        }
    }

    return {
        search,
        searchResults,
        isLoading,
        error
    }
}
