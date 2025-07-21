'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface Vehicle {
  id: string
  brand: string
  model: string
  price: number
  images: string[]
  year: number
}

export default function ProfilePage() {
  const [listings, setListings] = useState<Vehicle[]>([])
  const [saved, setSaved] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError || !userData?.user) return

      const userId = userData.user.id

      // Fetch user listings
      const { data: userVehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)

      setListings(userVehicles || [])

      // Fetch saved cars
      const { data: savedVehicles } = await supabase
        .from('saved_cars')
        .select('vehicle_id, vehicles (*)')
        .eq('user_id', userId)

      const formattedSaved = (savedVehicles || []).map((item) => item.vehicles).flat()
      setSaved(formattedSaved)

      setLoading(false)
    }

    fetchData()
  }, [])

  const deleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (!error) setListings((prev) => prev.filter((v) => v.id !== id))
  }

  return (
    <div className="p-4 space-y-10 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold">My Listings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : listings.length === 0 ? (
        <p className="text-gray-600">You have not listed any vehicles yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {listings.map((vehicle) => (
            <div key={vehicle.id} className="border rounded p-4 shadow space-y-2">
              <Image
                src={vehicle.images?.[0] || '/placeholder.jpg'}
                alt={vehicle.model}
                width={400}
                height={192}
                className="w-full h-48 object-cover rounded"
                style={{ objectFit: 'cover', borderRadius: '0.5rem' }}
                priority
              />
              <div>
                <h3 className="font-bold text-lg">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </h3>
                <p className="text-gray-600">${vehicle.price}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/edit/${vehicle.id}`}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteVehicle(vehicle.id)}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mt-10">Saved Cars</h2>
      {loading ? (
        <p>Loading...</p>
      ) : saved.length === 0 ? (
        <p className="text-gray-600">You havent saved any cars yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {saved.map((vehicle) => (
            <div key={vehicle.id} className="border rounded p-4 shadow space-y-2">
              <Image
                src={vehicle.images?.[0] || '/placeholder.jpg'}
                alt={vehicle.model}
                width={400}
                height={192}
                className="w-full h-48 object-cover rounded"
                style={{ objectFit: 'cover', borderRadius: '0.5rem' }}
                priority
              />
              <div>
                <h3 className="font-bold text-lg">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </h3>
                <p className="text-gray-600">${vehicle.price}</p>
              </div>
              <Link
                href={`/vehicle/${vehicle.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
