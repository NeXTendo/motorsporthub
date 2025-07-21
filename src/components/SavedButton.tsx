// SavedButton.tsx
'use client'
import { useSavedCarsStore } from '../store/useSavedCarsStore'

export default function SavedButton({ carId }: { carId: string }) {
  const { savedCars, toggleSave } = useSavedCarsStore()

  const isSaved = savedCars.includes(carId)

  return (
    <button onClick={() => toggleSave(carId)}>
      {isSaved ? '💖 Saved' : '🤍 Save'}
    </button>
  )
}
