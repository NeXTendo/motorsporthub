'use client'

import { useEffect, useRef, useState } from 'react'
import { Tabs, type TabsProps, Button, Carousel, Card, Typography } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { supabase } from '@/lib/supabase'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'
import SearchFilters from '../components/SearchFilters'
import ListingGrid from '../components/ListingGrid'
import { Cars } from '@/components/homeComponents/Cars'
import { Bikes } from '@/components/homeComponents/Bikes'
import { Trucks } from '@/components/homeComponents/Trucks'
import { Water } from '@/components/homeComponents/Water'

const { Title, Paragraph } = Typography

type NewsItem = {
  url: string
  image_url: string
  title: string
  description: string
}

type Brand = {
  name: string
  logoUrl: string
}

const categoriesItems: TabsProps['items'] = [
  { key: 'Cars', label: 'Cars', children: <Cars /> },
  { key: 'Bikes', label: 'Bikes', children: <Bikes /> },
  { key: 'Trucks', label: 'Trucks', children: <Trucks /> },
  { key: 'Water', label: 'Water', children: <Water /> },
]

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('Cars')
  const [news, setNews] = useState<NewsItem[]>([])
  const [lifestyle, setLifestyle] = useState<NewsItem[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const heroInterval = useRef<NodeJS.Timeout | null>(null)

  const heroSlides = [
    {
      title: 'Luxury, Exotic & Rare Vehicles',
      desc: 'Buy, Sell, Explore premium vehicles anytime, anywhere.',
      btn: 'Sell My Vehicle',
      href: '/sell',
      bg: '/hero/slide-1.jpg',
    },
    {
      title: 'Sponsored Post',
      desc: 'Discover our premium listing service to feature your exotic car.',
      btn: 'Learn More',
      href: '/sponsored',
      bg: '/hero/slide-2.jpg',
    },
    {
      title: 'Most Viewed Article',
      desc: 'Explore the rise of EV hypercars in the global market.',
      btn: 'Read Now',
      href: '/articles/most-viewed',
      bg: '/hero/slide-3.jpg',
    },
    {
      title: 'About MotorsportHub',
      desc: 'Learn the rich history and mission behind our platform.',
      btn: 'Discover More',
      href: '/about',
      bg: '/hero/slide-4.jpg',
    },
  ]

  useEffect(() => {
    heroInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(heroInterval.current!)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, lifestyleRes, { data: brandData }] = await Promise.all([
          axios.get<{ data: NewsItem[] }>(
            'https://api.marketaux.com/v1/news/all?category=automobile&language=en&api_token=JmxQwbGNV3DMhikjas2IhiAWw8Rn2I07Lw0dMFC6'
          ),
          axios.get<{ data: NewsItem[] }>(
            'https://api.thenewsapi.com/v1/news/top?categories=lifestyle&language=en&api_token=hR5t7y309w7zpqIkXoHNH94Fr34DWvs8IBACNC7k'
          ),
          supabase.from('vehicles').select('brand'),
        ])

        const uniqueBrandNames = [
          ...new Set((brandData ?? []).map((b) => b.brand)),
        ]

        const extensions = ['png', 'jpg']

        const brandPromises = uniqueBrandNames.map(async (name): Promise<Brand | null> => {
          const slug = name.toLowerCase().replace(/ /g, '-')
          for (const ext of extensions) {
            const { data } = supabase.storage.from('brands').getPublicUrl(`${slug}.${ext}`)
            if (data?.publicUrl) {
              return { name, logoUrl: data.publicUrl }
            }
          }
          return null
        })

        const resolvedBrands = (await Promise.all(brandPromises)).filter(
          (b): b is Brand => b !== null
        )

        setNews(newsRes.data.data || [])
        setLifestyle(lifestyleRes.data.data || [])
        setBrands(resolvedBrands)
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-10 px-4 pt-4 pb-12 max-w-7xl mx-auto overflow-hidden">
      {/* Hero Carousel */}
      <Carousel
        autoplay
        autoplaySpeed={5000}
        dots
        afterChange={(index) => setCurrentSlide(index)}
        arrows
      >
        {heroSlides.map((slide, idx) => (
          <div key={idx} className="relative h-[420px] rounded-xl overflow-hidden">
            <Image src={slide.bg} fill className="object-cover" alt="slide" priority={idx === 0} />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center text-white p-4">
              <Title level={2} className="!text-white mb-2">{slide.title}</Title>
              <Paragraph className="text-gray-200 max-w-xl mb-4">{slide.desc}</Paragraph>
              <Link href={slide.href} className="px-6 py-3 rounded-full bg-white text-black font-semibold shadow hover:bg-gray-200">
                {slide.btn}
              </Link>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Tabs */}
      <Tabs defaultActiveKey="Cars" items={categoriesItems} onChange={setSelectedCategory} />

      <SearchFilters selectedCategory={selectedCategory} />

      {/* Brand Carousel */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <Title level={3}>Shop By Make</Title>
          <div className="flex gap-2">
            <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => document.getElementById('brand-scroll')?.scrollBy({ left: -300, behavior: 'smooth' })} />
            <Button shape="circle" icon={<ArrowRightOutlined />} onClick={() => document.getElementById('brand-scroll')?.scrollBy({ left: 300, behavior: 'smooth' })} />
          </div>
        </div>
        <div id="brand-scroll" className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2">
          {brands.map((brand, idx) => (
            <Card
              key={idx}
              hoverable
              className="min-w-[140px] text-center"
              cover={
                <div className="relative h-24 bg-white">
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              }
            >
              <Card.Meta title={brand.name} className="!text-center" />
            </Card>
          ))}
        </div>
      </section>

      {/* News */}
      <section>
        <Title level={3}>Automotive News</Title>
        <div className="grid md:grid-cols-3 gap-6">
          {news.map((item, idx) => (
            <a key={idx} href={item.url} target="_blank" className="block rounded-lg overflow-hidden shadow hover:shadow-lg">
              <div className="relative h-40">
                <Image src={`/api/image-proxy?url=${encodeURIComponent(item.image_url || '')}`} alt="News" fill className="object-cover" />
              </div>
              <div className="p-4 bg-white">
                <h3 className="text-lg font-bold line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mt-2">{item.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Lifestyle */}
      <section>
        <Title level={3}>Luxury Lifestyle</Title>
        <div className="grid md:grid-cols-3 gap-6">
          {lifestyle.map((item, idx) => (
            <a key={idx} href={item.url} target="_blank" className="block rounded-lg overflow-hidden shadow hover:shadow-lg">
              <div className="relative h-40">
                <Image src={`/api/image-proxy?url=${encodeURIComponent(item.image_url || '')}`} alt="Lifestyle" fill className="object-cover" />
              </div>
              <div className="p-4 bg-white">
                <h3 className="text-lg font-bold line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mt-2">{item.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
