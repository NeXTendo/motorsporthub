'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [imgErrorCount, setImgErrorCount] = useState(0)
  const [defaultProfilePic, setDefaultProfilePic] = useState('/fallback-profile.png')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    const fetchAssets = async () => {
      const profile = supabase.storage.from('other').getPublicUrl('default-profile.png')
      const logo = supabase.storage.from('other').getPublicUrl('motorsporthub-main.png')

      if (profile.data?.publicUrl) setDefaultProfilePic(profile.data.publicUrl)
      if (logo.data?.publicUrl) setLogoUrl(logo.data.publicUrl)
    }

    fetchUser()
    fetchAssets()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const profileSrc =
    imgErrorCount > 0 || !user?.user_metadata?.avatar_url
      ? defaultProfilePic
      : user.user_metadata.avatar_url

  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User'

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
          scrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-black">
            {logoUrl ? (
              <div className="relative w-8 h-8">
                <Image
                  src={logoUrl}
                  alt="MotorsportHub Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm select-none">
                M
              </div>
            )}
            <h1 className="text-lg font-bold tracking-tight select-none">MotorsportHub</h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-4">
            {user ? (
              <Link href="/profile" className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  key={imgErrorCount}
                  src={profileSrc}
                  alt="Profile"
                  fill
                  sizes="32px"
                  className="object-cover border border-gray-300"
                  onError={() => setImgErrorCount((c) => c + 1)}
                />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-blue-600 border border-blue-600 px-4 py-2 rounded-full hover:bg-blue-50 text-sm font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 relative"
          >
            <span
              className={`block h-0.5 w-6 bg-current transform transition duration-300 ${
                menuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1.5'
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-opacity duration-300 ${
                menuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transform transition duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1.5'
              }`}
            />
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-300">
                    <Image
                      key={imgErrorCount + 100}
                      src={profileSrc}
                      alt="Profile"
                      fill
                      sizes="36px"
                      className="object-cover"
                      onError={() => setImgErrorCount((c) => c + 1)}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{displayName}</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="w-full bg-red-600 text-white py-2 rounded-full hover:bg-red-700 transition text-sm font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center border border-blue-600 text-blue-600 py-2 rounded-full hover:bg-blue-50 transition text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      {/* Offset to avoid hero overlap */}
      <div className="h-16 md:h-[72px]" />
    </>
  )
}
