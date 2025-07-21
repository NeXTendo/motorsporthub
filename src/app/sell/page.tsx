// src/app/sell/page.tsx
import VehicleForm from '../../components/VehicleForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sell Your Vehicle | MotorsportHub',
  description: 'List your car, bike, truck, or watercraft for sale on MotorsportHub.',
}

export default function SellPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          List Your Vehicle
        </h1>
        <p className="text-gray-600 mt-2">
          Complete the form below to put your vehicle on the market.
        </p>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <VehicleForm />
      </div>
    </div>
  )
}
