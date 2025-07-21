import '../styles/globals.css'
import { ReactNode } from 'react'
import { Layout, ConfigProvider } from 'antd'
import Header from '../components/Header'
import Footer from '../components/Footer'
import QueryProvider from './providers/QueryProvider'

export const metadata = {
  title: 'MotorsportHub',
  description: 'Browse, sell, and buy cars — globally.',
}

const { Content } = Layout

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#00c2a8',
                fontFamily: 'Inter, sans-serif',
              },
            }}
          >
            <Layout style={{ minHeight: '100vh', background: '#fff' }}>
              <Header />
              <Content style={{ flex: 1, paddingTop: 64 }}>{children}</Content>
              <Footer />
            </Layout>
          </ConfigProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
