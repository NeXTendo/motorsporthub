import Image from 'next/image'
import Link from 'next/link'
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDollarSign,
} from 'react-icons/fa'
import { useState } from 'react'

interface Car {
  id: string | number
  brand: string
  model: string
  trim?: string
  year: number
  mileage: number
  price: number
  images?: string[]
  condition?: 'New' | 'Used' | 'Certified' | string
  location?: string
}

export default function VehicleCard({ car }: { car: Car }) {
  const [imgLoading, setImgLoading] = useState(true)

  return (
    <Link
      href={`/vehicle/${car.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        {imgLoading && <div className="absolute inset-0 animate-pulse bg-gray-300" />}
        <Image
          src={car.images?.[0] || '/placeholder.jpg'}
          alt={`${car.brand} ${car.model}`}
          fill
          className={`object-cover transition-opacity duration-500 ${
            imgLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoadingComplete={() => setImgLoading(false)}
          sizes="(max-width: 768px) 100vw, 400px"
        />
        {car.condition && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-sm select-none">
            {car.condition}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-grow">
        <h3
          className="text-lg font-semibold leading-tight truncate"
          title={`${car.brand} ${car.model} ${car.trim || ''}`}
        >
          {car.brand} {car.model} {car.trim || ''}
        </h3>

        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaTachometerAlt className="text-gray-400" />
            <span>{car.mileage.toLocaleString()} km</span>
          </div>
          {car.location && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400" />
              <span className="truncate max-w-full">{car.location}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2 text-green-600 font-bold text-lg flex items-center gap-1">
          <FaDollarSign />
          {car.price.toLocaleString()}
        </div>
      </div>
    </Link>
  )
}
