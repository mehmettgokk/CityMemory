import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { SavedPlace, Place } from '~/types/place'

const STORAGE_KEY = 'sehir-hafizasi-places'
const LEGACY_KEY = 'sehir-hafizasi'

export const usePlacesStore = defineStore('places',() => {

    const savedPlaces = ref<SavedPlace[]>([])
    const isInitialized = ref(false)
    const loadError = ref<string | null>(null)

    const load = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)
            if (data) {
                const parsed: SavedPlace[] = JSON.parse(data)
                if (!Array.isArray(parsed)) throw new Error('Beklenmeyen veri biçimi')
                savedPlaces.value = parsed.map(p => ({ ...p, id: p.id.replace('/', '-') }))
            }
        } catch (e) {
            console.error('LocalStorage okunurken hata oluştu', e)
            loadError.value = 'Kayıtlı mekanlar okunamadı; boş bir arşivle devam ediliyor.'
        }
        isInitialized.value = true
    }

    if (import.meta.client) {
        onNuxtReady(load)
    }

    // watch: savedPlaces dizisini izlemek için
    watch(savedPlaces, (newVal) => {
        if (isInitialized.value) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
            } catch (e) {
                console.error('LocalStorage yazılırken hata oluştu', e)
            }
        }
    }, { deep: true })

    // Yeni mekanı listeye ekleme fonksiyonu
    const addPlace = (place: Place) => {
        if (savedPlaces.value.find(p => p.id === place.id)) return

        savedPlaces.value.push({
            ...place,
            status: 'planned',
            savedAt: new Date().toISOString()
        })
    }

    // id verilen mekanı listeden silme fonksiyonu
    const removePlace = (id: string) => {
        savedPlaces.value = savedPlaces.value.filter(p => p.id !== id )
    }

    // Mekanın alanlarını kısmen güncelleme fonksiyonu (ör. sonradan bulunan adres)
    const updatePlace = (id: string, patch: Partial<SavedPlace>) => {
        const place = savedPlaces.value.find(p => p.id === id)
        if (place) Object.assign(place, patch)
    }
    
    // Ziyaret edildi olarak işaretleme fonksiyonu
    const markAsVisited = (id: string) => {
        const place = savedPlaces.value.find(p => p.id === id)
        if (place){
            place.status = 'visited'
            place.visitedAt = new Date().toISOString()
        }
    }

    // Verilen puanı güncelleme fonksiyonu
    const updateRating = (id: string, rating: number) => {
        const place = savedPlaces.value.find(p => p.id === id)
        if (place) place.rating = rating
    }


    // yazılan notu güncelleme fonksiyonu
    const updateNote = (id: string, note: string) => {
        const place = savedPlaces.value.find(p => p.id ===id)
        if (place) place.note = note
    }

    //ID ile mekanı geri döndürme fonksiyonu 
    const getPlaceById = (id: string) => {
        return savedPlaces.value.find(p => p.id === id)
    }


    return {
        savedPlaces,
        isInitialized,
        loadError,
        addPlace,
        removePlace,
        updatePlace,
        markAsVisited,
        updateRating,
        updateNote,
        getPlaceById
    }
})
