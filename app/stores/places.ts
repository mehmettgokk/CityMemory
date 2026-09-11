import { defineStore } from 'pinia'
import { ref, onMounted, watch } from 'vue'
import type { SavedPlace, Place } from '~/types/place'

export const usePlacesStore = defineStore('places',() => {

    const savedPlaces = ref<SavedPlace[]>([])
    const isInitialized = ref(false)

    onMounted(() =>{
        const data = localStorage.getItem('sehir-hafizasi-places')
        if(data){
            try{
                savedPlaces.value = JSON.parse(data)
            }catch (e){
            console.error('LocalStorage okunurken hata oluştu', e)
            }
        }
        isInitialized.value = true
    })

    // watch: savedPlaces dizisini izlemek için
    watch(savedPlaces, (newVal) => {
        if (isInitialized.value) {
            localStorage.setItem('sehir-hafizasi', JSON.stringify(newVal))
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
        addPlace,
        removePlace,
        markAsVisited,
        updateRating,
        updateNote,
        getPlaceById
    }
})
