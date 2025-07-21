import { ReactNode } from 'react'

type LayoutWrapperProps = {
  children: ReactNode
  loading?: boolean
}

export default function LayoutWrapper({ children, loading = false }: LayoutWrapperProps) {
  return (
    <div className="mx-auto max-w-7xl relative">
      {/* Loading bar */}
      <div
        className={`absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-300 ease-in-out ${
          loading ? 'w-full opacity-100' : 'w-0 opacity-0'
        }`}
      />

      {children}
    </div>
  )
}
