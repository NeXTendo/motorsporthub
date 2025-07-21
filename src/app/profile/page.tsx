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

interface Purchase {
  id: string
  vehicle: Vehicle
  purchase_date: string
  price_paid: number
}

interface Message {
  id: string
  from: string
  subject: string
  content: string
  date: string
  read: boolean
}

interface User {
  id: string
  email: string
  full_name: string | null
  profile_image: string | null
}

type Tab = 'listings' | 'saved' | 'purchases' | 'account' | 'messages'

export default function ProfilePage() {
  const [listings, setListings] = useState<Vehicle[]>([])
  const [saved, setSaved] = useState<Vehicle[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('listings')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData?.user) {
        setLoading(false)
        return
      }

      const userId = authData.user.id

      // Fetch user info
      const { data: userInfo } = await supabase
        .from('profiles')
        .select('id, email, full_name, profile_image')
        .eq('id', userId)
        .single()
      setUser(userInfo || null)

      // Fetch listings
      const { data: userVehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)
      setListings(userVehicles || [])

      // Fetch saved cars
      const { data: savedVehicles } = await supabase
        .from('saved_cars')
        .select('vehicle_id, vehicles(*)')
        .eq('user_id', userId)
      const formattedSaved = (savedVehicles || []).map((item) => item.vehicles).flat()
      setSaved(formattedSaved)

      // Fetch purchases
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('id, purchase_date, price_paid, vehicle:vehicles(*)')
        .eq('user_id', userId)
      const formattedPurchases = (purchaseData || []).map((p) => ({
        id: p.id,
        purchase_date: p.purchase_date,
        price_paid: p.price_paid,
        vehicle: p.vehicle,
      }))
      setPurchases(formattedPurchases)

      // Fetch messages
      const { data: messageData } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', userId)
        .order('date', { ascending: false })
      setMessages(messageData || [])

      setLoading(false)
    }

    fetchData()
  }, [])

  const deleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (!error) setListings((prev) => prev.filter((v) => v.id !== id))
  }

  const markMessageRead = async (id: string) => {
    await supabase.from('messages').update({ read: true }).eq('id', id)
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m))
    )
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-10">

      {/* User Info Section */}
      {user && (
        <section className="flex items-center gap-4 p-4 bg-white rounded shadow">
          <Image
            src={user.profile_image || '/placeholder-profile.png'}
            alt={user.full_name || 'User'}
            width={80}
            height={80}
            className="rounded-full object-cover"
            priority
          />
          <div>
            <h1 className="text-2xl font-bold">{user.full_name || 'User'}</h1>
            <p className="text-gray-600">{user.email}</p>
            <Link
              href="/profile/edit"
              className="mt-1 inline-block text-sm text-blue-600 hover:underline"
            >
              Edit Profile
            </Link>
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-300 overflow-x-auto no-scrollbar">
        {(['listings', 'saved', 'purchases', 'account', 'messages'] as Tab[]).map((tab) => {
          const labels: Record<Tab, string> = {
            listings: `My Listings (${listings.length})`,
            saved: `Saved Cars (${saved.length})`,
            purchases: `Purchase History (${purchases.length})`,
            account: 'Account Settings',
            messages: `Messages (${messages.filter((m) => !m.read).length})`,
          }
          return (
            <button
              key={tab}
              className={`px-4 py-2 -mb-px font-semibold border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <section>
        {loading ? (
          <p>Loading...</p>
        ) : activeTab === 'listings' ? (
          listings.length === 0 ? (
            <p className="text-gray-600">You have not listed any vehicles yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {listings.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="relative border rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow bg-white"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={vehicle.images?.[0] || '/placeholder.jpg'}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      fill
                      className="object-cover"
                      priority
                    />
                    {/* Price badge */}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg">
                      ${vehicle.price.toLocaleString()}
                    </div>
                    {/* Gradient overlay with text */}
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
                      <h3 className="text-white text-sm font-semibold truncate">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </h3>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex justify-between items-center p-2">
                    <Link
                      href={`/edit/${vehicle.id}`}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteVehicle(vehicle.id)}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'saved' ? (
          saved.length === 0 ? (
            <p className="text-gray-600">You haven't saved any cars yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {saved.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="relative border rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow bg-white"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={vehicle.images?.[0] || '/placeholder.jpg'}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      fill
                      className="object-cover"
                      priority
                    />
                    {/* Price badge */}
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg">
                      ${vehicle.price.toLocaleString()}
                    </div>
                    {/* Gradient overlay with text */}
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
                      <h3 className="text-white text-sm font-semibold truncate">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </h3>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      href={`/vehicle/${vehicle.id}`}
                      className="block text-center text-sm text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'purchases' ? (
          purchases.length === 0 ? (
            <p className="text-gray-600">You have no purchase history.</p>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="border rounded p-4 shadow flex gap-4">
                  <Image
                    src={purchase.vehicle.images?.[0] || '/placeholder.jpg'}
                    alt={purchase.vehicle.model}
                    width={120}
                    height={72}
                    className="rounded object-cover"
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                  <div>
                    <h3 className="font-bold">
                      {purchase.vehicle.brand} {purchase.vehicle.model} ({purchase.vehicle.year})
                    </h3>
                    <p>Purchased on: {new Date(purchase.purchase_date).toLocaleDateString()}</p>
                    <p>Price Paid: ${purchase.price_paid}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'account' ? (
          <div className="p-4 bg-white rounded shadow space-y-4 max-w-md">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <p className="text-gray-600">Here you can add options to update your password, email, notification preferences, etc.</p>
            <Link href="/profile/edit" className="text-blue-600 hover:underline">
              Edit Profile Info
            </Link>
          </div>
        ) : activeTab === 'messages' ? (
          messages.length === 0 ? (
            <p className="text-gray-600">You have no messages.</p>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`border rounded p-4 cursor-pointer ${
                    msg.read ? 'bg-gray-100' : 'bg-white shadow'
                  }`}
                  onClick={() => {
                    if (!msg.read) markMessageRead(msg.id)
                  }}
                  title="Click to mark as read"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">{msg.subject}</p>
                    <p className="text-xs text-gray-500">{new Date(msg.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-700">{msg.content}</p>
                  <p className="text-sm text-gray-500 mt-2">From: {msg.from}</p>
                </div>
              ))}
            </div>
          )
        ) : null}
      </section>
    </div>
  )
}
