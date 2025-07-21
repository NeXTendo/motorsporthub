'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('user')
  const [contactInfo, setContactInfo] = useState('{}')
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validRoles = ['user', 'admin', 'dealer']

  const isPasswordStrong = (pw: string) =>
    pw.length >= 8 && /[A-Z]/.test(pw) && /\d/.test(pw)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isPasswordStrong(password)) {
      setError('Password must be at least 8 characters, with a number and uppercase letter.')
      return
    }

    if (!validRoles.includes(role)) {
      setError('Invalid role selected.')
      return
    }

    let parsedContact
    try {
      parsedContact = JSON.parse(contactInfo)
    } catch {
      setError('Invalid contact info. Must be valid JSON.')
      return
    }

    setLoading(true)

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError
      const user = signUpData.user
      if (!user) throw new Error('No user returned after signup')

      // Upload private profile image if provided
      let uploadedImagePath = ''
      if (profileImageFile) {
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(`private/${user.id}/avatar.png`, profileImageFile, {
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) console.warn('Image upload failed:', uploadError.message)
        uploadedImagePath = `private/${user.id}/avatar.png`
      }

      // Insert into public.users
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: user.id,
          email,
          full_name: fullName,
          role,
          contact_info: parsedContact,
          profile_image: uploadedImagePath,
        },
      ])
      if (dbError) throw dbError

      router.push('/profile')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
        Create an Account
      </h2>
      <form onSubmit={handleSignup} className="space-y-5">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input input-bordered w-full"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full"
          required
        />

        <input
          type="password"
          placeholder="Password (Min 8 chars, 1 number, 1 uppercase)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered w-full"
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="user">User</option>
          <option value="dealer">Dealer</option>
          <option value="admin">Admin</option>
        </select>

        <textarea
          placeholder='Contact Info (JSON): {"phone": "+260...", "city": "Lusaka"}'
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          rows={3}
          className="textarea textarea-bordered w-full"
        />

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setProfileImageFile(file)
                setProfileImageUrl(URL.createObjectURL(file))
              }
            }}
            className="file-input file-input-bordered"
          />
          {profileImageUrl && (
            <img
              src={profileImageUrl}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500"
            />
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Sign Up'}
        </button>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Forgot your password?{' '}
          <a
            href="/auth/reset"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Reset it here
          </a>
        </p>

        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  )
}
