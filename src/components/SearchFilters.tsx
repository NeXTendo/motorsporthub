'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { uniqBy } from 'lodash'
import { useRouter } from 'next/navigation'
import {
  Form,
  Select,
  InputNumber,
  Button,
  Typography,
  Row,
  Col,
  Collapse,
} from 'antd'

const { Title, Text } = Typography
const { Option } = Select
const { Panel } = Collapse

interface Props {
  selectedCategory: string
}

interface VehicleFilters {
  brand?: string
  model?: string
  trim?: string
  minPrice?: string
  maxPrice?: string
  yearMin?: string
  yearMax?: string
}

const fetchBrandModelTrim = async () => {
  const { data, error } = await supabase.from('vehicles').select('brand, model, trim')
  if (error) throw new Error(error.message)
  return uniqBy(data, (item) => `${item.brand}-${item.model}-${item.trim}`)
}

const fetchFilteredCount = async (filters: VehicleFilters) => {
  let query = supabase.from('vehicles').select('*', { count: 'exact', head: true })

  if (filters.brand) query = query.eq('brand', filters.brand)
  if (filters.model) query = query.eq('model', filters.model)
  if (filters.trim) query = query.eq('trim', filters.trim)
  if (filters.minPrice) query = query.gte('price', Number(filters.minPrice))
  if (filters.maxPrice) query = query.lte('price', Number(filters.maxPrice))
  if (filters.yearMin) query = query.gte('year', Number(filters.yearMin))
  if (filters.yearMax) query = query.lte('year', Number(filters.yearMax))

  const { count, error } = await query
  if (error) throw new Error(error.message)
  return count || 0
}

export default function SearchFilters({ selectedCategory }: Props) {
  const [form] = Form.useForm()
  const router = useRouter()

  const [filters, setFilters] = useState<VehicleFilters>({})

  const { data: brandData, isLoading, isError } = useQuery({
    queryKey: ['brand-model-trim'],
    queryFn: fetchBrandModelTrim,
  })

  const { data: liveCount } = useQuery({
    queryKey: ['vehicle-count', filters],
    queryFn: () => fetchFilteredCount(filters),
    enabled: Object.values(filters).some(Boolean),
  })

  const brandOptions = [...new Set(brandData?.map((v) => v.brand))]
  const modelOptions = brandData
    ?.filter((v) => v.brand === form.getFieldValue('brand'))
    .map((v) => v.model)
    .filter((val, i, arr) => arr.indexOf(val) === i)

  const trimOptions = brandData
    ?.filter((v) => v.brand === form.getFieldValue('brand') && v.model === form.getFieldValue('model'))
    .map((v) => v.trim)
    .filter((val, i, arr) => arr.indexOf(val) === i)

const handleSearch = (values: VehicleFilters) => {
  const activeFilters: VehicleFilters = {
    ...values,
    minPrice: values.minPrice?.toString(),
    maxPrice: values.maxPrice?.toString(),
    yearMin: values.yearMin?.toString(),
    yearMax: values.yearMax?.toString(),
  }

  setFilters(activeFilters)

  const params = new URLSearchParams()
  Object.entries(activeFilters).forEach(([key, value]) => {
    if (value) params.append(key, value)
  })

  router.push(`/search?${params.toString()}`)
}


  return (
    <div className="bg-white rounded shadow p-5">
      <Title level={4}>Search Filters</Title>
      <Text type="secondary">Filtering for: <strong>{selectedCategory}</strong></Text>

      {isLoading && <Text>Loading brands...</Text>}
      {isError && <Text type="danger">Failed to load filter data.</Text>}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        className="mt-4"
      >
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="brand" label="Brand">
              <Select
                allowClear
                onChange={() => {
                  form.setFieldsValue({ model: undefined, trim: undefined })
                }}
              >
                {brandOptions?.map((b) => (
                  <Option key={b} value={b}>{b}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="model" label="Model">
              <Select
                disabled={!form.getFieldValue('brand')}
                allowClear
                onChange={() => form.setFieldsValue({ trim: undefined })}
              >
                {modelOptions?.map((m) => (
                  <Option key={m} value={m}>{m}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="trim" label="Trim">
              <Select disabled={!form.getFieldValue('model')} allowClear>
                {trimOptions?.map((t) => (
                  <Option key={t} value={t}>{t}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Form.Item name="minPrice" label="Min Price">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="maxPrice" label="Max Price">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="yearMin" label="Min Year">
              <InputNumber className="w-full" min={1900} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item name="yearMax" label="Max Year">
              <InputNumber className="w-full" min={1900} />
            </Form.Item>
          </Col>
        </Row>

        <Collapse ghost>
          <Panel header="+ More Options" key="1">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item name="transmission" label="Transmission">
                  <Select allowClear>
                    <Option value="Manual">Manual</Option>
                    <Option value="Automatic">Automatic</Option>
                    <Option value="CVT">CVT</Option>
                    <Option value="Semi-Automatic">Semi-Automatic</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="fuelType" label="Fuel Type">
                  <Select allowClear>
                    <Option value="Petrol">Petrol</Option>
                    <Option value="Diesel">Diesel</Option>
                    <Option value="Electric">Electric</Option>
                    <Option value="Hybrid">Hybrid</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="driveType" label="Drive Type">
                  <Select allowClear>
                    <Option value="FWD">FWD</Option>
                    <Option value="RWD">RWD</Option>
                    <Option value="AWD">AWD</Option>
                    <Option value="4x4">4x4</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>

        <Form.Item className="text-right mt-4">
          <Button type="primary" htmlType="submit" block>
            Search Results ({liveCount ?? 0})
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
