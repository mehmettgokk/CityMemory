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

    watch(savedPlaces, (newVal) => {
        if (isInitialized.value) {
            localStorage.setItem('sehir-hafizasi', JSON.stringify(newVal))
        }
    }, { deep: true })

    const addPlace = (place: Place) => {
        if (savedPlaces.value.find(p => p.id === place.id)) return

        savedPlaces.value.push({
            ...place,
            status: 'planned',
            savedAt: new Date().toISOString()
        })
    }

    const removePlace = (id: string) => {
        savedPlaces.value = savedPlaces.value.filter(p => p.id !== id )
    }
    
    const markAsVisited = (id: string) => {
        const place = savedPlaces.value.find(p => p.id === id)
        if (place){
            place.status = 'visited'
            place.visitedAt = new Date().toISOString()
        }
    }

    const updateRating = (id: string, rating: number) => {
        const place = savedPlaces.value.find(p => p.id === id)
        if (place) place.rating = rating
    }

    const updateNote = (id: string, note: string) => {
        const place = savedPlaces.value.find(p => p.id ===id)
        if (place) place.note = note
    }

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
        updateNote
 
    }
})
