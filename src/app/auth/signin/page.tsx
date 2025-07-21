'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SigninPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) return setError(signInError.message)

    router.push('/profile')
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Sign In</h2>
      <form onSubmit={handleSignin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input w-full"
          required
        />
        <button
          type="submit"
          className="bg-black text-white w-full py-2 rounded"
        >
          Sign In
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}
