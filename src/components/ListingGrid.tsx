'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Row, Col, Pagination, Select, Typography, Empty } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import VehicleCard from './VehicleCard'

const { Title } = Typography
const { Option } = Select

const PAGE_SIZE = 9

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  mileage: number
  price: number
  images?: string[]
  trim?: string
  condition?: string
  location?: string
}

interface Filters {
  brand?: string
  model?: string
  trim?: string
  minPrice?: string
  maxPrice?: string
  yearMin?: string
  yearMax?: string
  sort?: 'price_asc' | 'price_desc' | 'year_asc' | 'year_desc'
}

interface VehiclesResponse {
  vehicles: Vehicle[]
  total: number
}

interface ListingGridProps {
  selectedCategory: string
}

export default function ListingGrid({ selectedCategory }: ListingGridProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  const searchParamsString = searchParams.toString()
  const filters: Filters = Object.fromEntries(searchParams.entries()) as Filters

  const sortOption = filters.sort || 'price_desc'
  const [sortField, sortDirection] = sortOption.split('_') as ['price' | 'year', 'asc' | 'desc']
  const offset = (currentPage - 1) * PAGE_SIZE

  const { data, isLoading, error } = useQuery<VehiclesResponse>({
    queryKey: ['vehicles', selectedCategory, filters, currentPage],
    queryFn: async () => {
      const query = supabase
        .from('vehicles')
        .select('*', { count: 'exact' })
        .eq('type', selectedCategory.toLowerCase())
        .eq('status', 'listed')
        .ilike('brand', `%${filters.brand || ''}%`)
        .ilike('model', `%${filters.model || ''}%`)
        .ilike('trim', `%${filters.trim || ''}%`)
        .gte('price', filters.minPrice || '0')
        .lte('price', filters.maxPrice || '999999999')
        .gte('year', filters.yearMin || '1900')
        .lte('year', filters.yearMax || new Date().getFullYear().toString())
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range(offset, offset + PAGE_SIZE - 1)

      const { data: vehicles, error, count } = await query
      if (error) throw new Error(error.message)
      return { vehicles: vehicles ?? [], total: count ?? 0 }
    }
    // keepPreviousData: true, // Uncomment if your version supports this
  })

  const updateQueryParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParamsString)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`?${params.toString()}`)
  }

  useEffect(() => {
    setCurrentPage(1) // Reset to first page on filter change
  }, [searchParamsString])

  return (
    <div className="mt-10">
      <Row justify="space-between" align="middle" className="mb-6 px-2">
        <Col>
          <Title level={4}>
            {(data?.total ?? 0).toLocaleString()} {selectedCategory}s found
          </Title>
        </Col>
        <Col>
          <Select
            value={sortOption}
            onChange={(val) => updateQueryParam('sort', val)}
            className="min-w-[180px]"
          >
            <Option value="price_desc">Price: High → Low</Option>
            <Option value="price_asc">Price: Low → High</Option>
            <Option value="year_desc">Year: Newest</Option>
            <Option value="year_asc">Year: Oldest</Option>
          </Select>
        </Col>
      </Row>

      {isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Col xs={24} sm={12} xl={8} key={i}>
              <div className="h-48 rounded bg-gray-100 animate-pulse" />
            </Col>
          ))}
        </Row>
      ) : error ? (
        <p className="text-center text-red-500 py-10">Failed to load vehicles.</p>
      ) : data?.vehicles.length === 0 ? (
        <Empty description={`No ${selectedCategory.toLowerCase()}s match your filters`} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {data?.vehicles.map((car, idx) => (
              <Col xs={24} sm={12} xl={8} key={car.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <VehicleCard car={car} />
                </motion.div>
              </Col>
            ))}
          </Row>

          <div className="flex justify-center mt-10">
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={data?.total ?? 0}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  )
}
