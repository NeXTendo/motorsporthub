// useSavedCarsStore.ts
import { create } from 'zustand'

export const useSavedCarsStore = create<{
  savedCars: string[]
  toggleSave: (id: string) => void
}>((set, get) => ({
  savedCars: [],
  toggleSave: (id) => {
    const saved = get().savedCars
    const updated = saved.includes(id) ? saved.filter(i => i !== id) : [...saved, id]
    set({ savedCars: updated })
  },
}))
