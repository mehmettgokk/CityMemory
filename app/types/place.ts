
export interface Place {
  id: string
  name: string
  category: string
  latitude: number
  longitude: number
  address?: string
}

export interface SavedPlace extends Place {
  status: 'planned' | 'visited'
  rating?: number
  note?: string
  savedAt: string
  visitedAt?: string
}