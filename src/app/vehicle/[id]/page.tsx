'use client'

import React, { JSX, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Head from 'next/head'
import {
  CarFront,
  GaugeCircle,
  Fuel,
  Settings,
  MoveRight,
  Thermometer,
  CircleDot,
  MapPin,
  Droplets,
  ArrowUp
} from 'lucide-react'

const specIcons: Record<string, JSX.Element> = {
  type: <CarFront size={24} className="mx-auto text-gray-500" />,
  transmission: <Settings size={24} className="mx-auto text-gray-500" />,
  fuel_type: <Fuel size={24} className="mx-auto text-gray-500" />,
  engine: <Thermometer size={24} className="mx-auto text-gray-500" />,
  power: <GaugeCircle size={24} className="mx-auto text-gray-500" />,
  torque: <MoveRight size={24} className="mx-auto text-gray-500" />,
  mileage: <GaugeCircle size={24} className="mx-auto text-gray-500" />,
  color: <Droplets size={24} className="mx-auto text-gray-500" />,
  condition: <CircleDot size={24} className="mx-auto text-gray-500" />,
  location: <MapPin size={24} className="mx-auto text-gray-500" />
}

type Dealer = {
  id: string
  email?: string
  full_name?: string
  profile_image?: string
  contact_info?: {
    phone?: string
    website?: string
  }
  role?: string
  rating?: number
  reviews_count?: number
  lat?: number
  lng?: number
}

type Vehicle = {
  id: string
  year: number
  brand: string
  model: string
  trim?: string
  price: number
  images?: string[]
  type?: string
  transmission?: string
  fuel_type?: string
  engine_type?: string
  engine_capacity?: string
  power_hp?: number
  torque_nm?: number
  mileage?: number
  color?: string
  condition?: string
  location?: string
  description?: string
  dealer_id?: string
  user_id?: string
}

export default function VehiclePage() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'specs' | 'desc'>('specs')
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()])

  useEffect(() => {
    async function fetchVehicleAndDealer() {
      setLoading(true)
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single()

      if (vehicleError) {
        console.error(vehicleError)
        setLoading(false)
        return
      }

      setVehicle(vehicleData)
      setSelectedImage(vehicleData?.images?.[0] || null)

      if (vehicleData?.user_id) {
        const { data: dealerData, error: dealerError } = await supabase
          .from('users')
          .select('id, email, full_name, profile_image, contact_info')
          .eq('id', vehicleData.user_id)
          .single()

        setDealer(dealerError ? null : dealerData)
      } else {
        setDealer(null)
      }

      setLoading(false)
    }

    if (id) fetchVehicleAndDealer()
  }, [id])

  if (loading) {
    return (
      <div className="p-4 animate-pulse space-y-4 max-w-screen-xl mx-auto">
        <div className="h-8 bg-gray-200 w-1/2 rounded" />
        <div className="aspect-video bg-gray-200 rounded" />
        <div className="h-6 bg-gray-200 w-full rounded" />
      </div>
    )
  }

  if (!vehicle) return <p className="p-4 text-center">Vehicle not found.</p>

  return (
    <>
      <Head>
        <title>{`${vehicle.year} ${vehicle.brand} ${vehicle.model} | AutoHub`}</title>
        <meta name="description" content={vehicle.description?.slice(0, 150)} />
        <meta property="og:image" content={vehicle.images?.[0] || '/placeholder.jpg'} />
      </Head>

      <div className="max-w-screen-xl mx-auto p-4 space-y-10 pb-32">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">
            {vehicle.year} {vehicle.brand} {vehicle.model} {vehicle.trim}
          </h1>
          <p className="text-3xl font-semibold text-gray-700">
            ${vehicle.price?.toLocaleString()}
          </p>

          {/* Tags */}
          <div className="flex justify-center gap-2 flex-wrap mt-2">
            {vehicle.condition && <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{vehicle.condition}</span>}
            {vehicle.transmission && <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">{vehicle.transmission}</span>}
            {vehicle.mileage && vehicle.mileage < 20000 && <span className="bg-green-100 px-3 py-1 rounded-full text-sm">Low Mileage</span>}
          </div>
        </div>

        {/* Main Image */}
        <div className="w-full aspect-video relative rounded-xl overflow-hidden shadow-lg">
          <Image
            src={selectedImage || vehicle.images?.[0] || '/placeholder.jpg'}
            alt="Main image"
            fill
            className="object-cover"
            sizes="100vw"
            placeholder="blur"
            blurDataURL="/placeholder.jpg"
          />
        </div>

        {/* Thumbnails */}
        {vehicle.images && vehicle.images.length > 1 && (
          <div ref={emblaRef} className="embla overflow-hidden mt-4">
            <div className="flex gap-4 px-2">
              {vehicle.images.map((img, index) => (
                <div
                  key={index}
                  className={`relative aspect-video h-24 w-36 shrink-0 rounded-md overflow-hidden cursor-pointer border-2 transition-colors ${
                    selectedImage === img ? 'border-black' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 10vw"
                    placeholder="blur"
                    blurDataURL="/placeholder.jpg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex border-b">
            <button
              className={`flex-1 p-3 font-semibold ${
                activeTab === 'specs' ? 'border-b-4 border-black text-black' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('specs')}
            >
              Specifications
            </button>
            <button
              className={`flex-1 p-3 font-semibold ${
                activeTab === 'desc' ? 'border-b-4 border-black text-black' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('desc')}
            >
              Description
            </button>
          </div>

          {activeTab === 'specs' && (
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {vehicle.type && renderSpec('type', 'Type', vehicle.type)}
              {vehicle.transmission && renderSpec('transmission', 'Transmission', vehicle.transmission)}
              {vehicle.fuel_type && renderSpec('fuel_type', 'Fuel', vehicle.fuel_type)}
              {(vehicle.engine_type || vehicle.engine_capacity) &&
                renderSpec('engine', 'Engine', `${vehicle.engine_type} ${vehicle.engine_capacity}`)}
              {vehicle.power_hp && renderSpec('power', 'Power', `${vehicle.power_hp} HP`)}
              {vehicle.torque_nm && renderSpec('torque', 'Torque', `${vehicle.torque_nm} Nm`)}
              {vehicle.mileage && renderSpec('mileage', 'Mileage', `${vehicle.mileage?.toLocaleString()} km`)}
              {vehicle.color && renderSpec('color', 'Color', vehicle.color)}
              {vehicle.condition && renderSpec('condition', 'Condition', vehicle.condition)}
              {vehicle.location && renderSpec('location', 'Location', vehicle.location)}
            </div>
          )}

          {activeTab === 'desc' && (
            <div className="p-6 text-gray-700 whitespace-pre-line">
              {vehicle.description || <span className="italic text-gray-400">No description provided.</span>}
            </div>
          )}
        </div>

        {/* Dealer Info */}
        {dealer && (
          <section className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Seller Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold">{dealer.full_name}</h3>
                {dealer.contact_info?.phone && (
                  <p><strong>Phone:</strong> <a href={`tel:${dealer.contact_info.phone}`} className="text-blue-600 hover:underline">{dealer.contact_info.phone}</a></p>
                )}
                {dealer.email && (
                  <p><strong>Email:</strong> <a href={`mailto:${dealer.email}`} className="text-blue-600 hover:underline">{dealer.email}</a></p>
                )}
                {dealer.contact_info?.website && (
                  <p><strong>Website:</strong> <a href={dealer.contact_info.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{dealer.contact_info.website}</a></p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Rating</h3>
                {dealer.rating ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < dealer.rating! ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.955L10 0l2.949 5.955 6.561.955-4.755 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span>{dealer.rating.toFixed(1)} ({dealer.reviews_count || 0} reviews)</span>
                  </div>
                ) : <p>No ratings yet.</p>}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Other Listings</h3>
                <Link href={`/dealer/${dealer.id}`} className="text-blue-600 hover:underline">View all vehicles</Link>
              </div>
            </div>

            {dealer.lat && dealer.lng && (
              <div className="mt-6 h-64 rounded overflow-hidden shadow-md">
                <iframe title="Dealer Location" width="100%" height="100%" frameBorder="0" src={`https://maps.google.com/maps?q=${dealer.lat},${dealer.lng}&hl=en&z=15&output=embed`} />
              </div>
            )}
          </section>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t px-4 py-3 md:hidden shadow-md flex justify-between">
        <Link href="/contact" className="bg-black text-white px-4 py-2 rounded-md w-full mr-2 text-center">Contact Seller</Link>
        <button className="border border-black text-black px-4 py-2 rounded-md w-full ml-2">Save</button>
      </div>

      {/* Back to Top Button */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-5 right-5 z-50 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800">
        <ArrowUp />
      </button>
    </>
  )
}

function renderSpec(key: string, label: string, value: string) {
  return (
    <div className="text-center space-y-2">
      {specIcons[key]}
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
