'use client'

import { useSearchParams } from 'next/navigation'
import { Layout, Row, Col, Typography, Card } from 'antd'
import SearchFilters from '@/components/SearchFilters'
import ListingGrid from '@/components/ListingGrid'

const { Content } = Layout
const { Title } = Typography

export default function SearchPage() {
  const searchParams = useSearchParams()

  const selectedCategory = searchParams.get('category') || 'car'

  const filters = {
    brand: searchParams.get('brand') || '',
    model: searchParams.get('model') || '',
    trim: searchParams.get('trim') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    yearMin: searchParams.get('yearMin') || '',
    yearMax: searchParams.get('yearMax') || '',
  }

  return (
    <Layout style={{ background: '#fff', padding: '40px 24px' }}>
      <Content>
        <Row gutter={[24, 24]}>
          {/* 🔍 Sidebar Filters */}
          <Col xs={24} lg={6}>
            <Card
              title={<Title level={5}>Filter Listings</Title>}
              bordered
              style={{ position: 'sticky', top: 96 }}
            >
              <SearchFilters selectedCategory={selectedCategory} />
            </Card>
          </Col>

          {/*Listings */}
          <Col xs={24} lg={18}>
            <ListingGrid selectedCategory={selectedCategory} filters={filters} />
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
