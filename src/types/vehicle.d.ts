// types/vehicle.d.ts

export interface Vehicle {
  id: string
  user_id: string
  brand: string
  model: string
  trim?: string
  type: string
  transmission?: string
  fuel_type?: string
  engine_type?: string
  engine_capacity?: string
  power_hp: number
  torque_nm: number
  price: number
  mileage: number
  year: number
  location?: string
  condition?: string
  color?: string
  images: string[]
  description?: string
  status: 'listed' | 'sold' | string
  created_at: string
}
export interface VehicleFilters {
  brand?: string
  model?: string
  trim?: string
  minPrice?: number
  maxPrice?: number
  yearMin?: number
  yearMax?: number
  mileageMin?: number
  mileageMax?: number
  location?: string
  condition?: string
  color?: string
}