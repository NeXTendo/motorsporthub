'use client'

import { supabase } from '../lib/supabase'
import VehicleCard from '../components/VehicleCard'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

interface ListingGridProps {
  selectedCategory: string
}

interface Vehicle {
  id: string
  brand: string
  model: string
  trim?: string
  year: number
  mileage: number
  price: number
  status: string
  type: string
  created_at: string
  images?: string[]
  condition?: string
  location?: string
}

// Sorting options
const sortOptions = [
  { label: 'Price: Low to High', value: { column: 'price', ascending: true } },
  { label: 'Price: High to Low', value: { column: 'price', ascending: false } },
  { label: 'Year: Newest First', value: { column: 'year', ascending: false } },
  { label: 'Year: Oldest First', value: { column: 'year', ascending: true } },
  { label: 'Mileage: Low to High', value: { column: 'mileage', ascending: true } },
  { label: 'Mileage: High to Low', value: { column: 'mileage', ascending: false } },
]

export default function ListingGrid({ selectedCategory }: ListingGridProps) {
  // Filters state (simplified for example, can expand or move out)
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [trim, setTrim] = useState('')

  // Sorting state: default to Price Low to High
  const [sort, setSort] = useState(sortOptions[0].value)

  // Compose query key including filters + sort for react-query cache
  const queryKey = ['vehicles', selectedCategory, brand, model, trim, sort]

  const { data, isLoading, error } = useQuery<Vehicle[]>({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('type', selectedCategory.toLowerCase())
        .eq('status', 'listed')

      if (brand) query = query.eq('brand', brand)
      if (model) query = query.eq('model', model)
      if (trim) query = query.eq('trim', trim)

      query = query.order(sort.column, { ascending: sort.ascending })

      const { data, error } = await query

      if (error) throw new Error(error.message)
      return data || []
    },
    staleTime: 1000 * 60 * 5,
  })

  // Optional: Reset model and trim if brand changes (to keep filters consistent)
  useEffect(() => {
    setModel('')
    setTrim('')
  }, [brand])

  useEffect(() => {
    setTrim('')
  }, [model])

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6">
      {/* Filters & Sorting UI */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Simple brand/model/trim dropdowns */}
        <select
          className="input"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="">All Brands</option>
          {/* Populate dynamically if you want */}
          <option value="Toyota">Toyota</option>
          <option value="Ford">Ford</option>
          <option value="Honda">Honda</option>
          {/* ... */}
        </select>

        <select
          className="input"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={!brand}
        >
          <option value="">All Models</option>
          {/* Populate based on brand */}
          {/* TODO: Fetch or derive models for selected brand */}
        </select>

        <select
          className="input"
          value={trim}
          onChange={(e) => setTrim(e.target.value)}
          disabled={!model}
        >
          <option value="">All Trims</option>
          {/* Populate based on model */}
          {/* TODO: Fetch or derive trims for selected model */}
        </select>

        {/* Sorting Dropdown */}
        <select
          className="input max-w-xs"
          value={JSON.stringify(sort)}
          onChange={(e) => setSort(JSON.parse(e.target.value))}
        >
          {sortOptions.map((option) => (
            <option key={option.label} value={JSON.stringify(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Listing */}
      {isLoading ? (
        <p className="text-center text-gray-400">Loading vehicles...</p>
      ) : error ? (
        <p className="text-center text-red-500">Failed to load vehicles.</p>
      ) : !data || data.length === 0 ? (
        <p className="text-center text-gray-500">No {selectedCategory.toLowerCase()} found.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {data.map((car) => (
            <li key={car.id} className="py-4">
              <VehicleCard car={car} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
