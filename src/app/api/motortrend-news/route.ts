import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

export async function GET() {
  try {
    const feed = await parser.parseURL('https://www.motortrend.com/feed/') // MotorTrend RSS feed URL

    // Map and clean the data for your frontend
    const items = feed.items.slice(0, 10).map(item => ({
      url: item.link || '',
      image_url: extractImageUrl(item.content || '') || '',
      title: item.title || '',
      description: item.contentSnippet || '',
    }))

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching MotorTrend RSS:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

// Helper to extract first image url from content HTML (simple regex)
function extractImageUrl(html: string): string | null {
  const match = html.match(/<img[^>]+src="?([^"\s]+)"?[^>]*\/>/)
  return match ? match[1] : null
}
