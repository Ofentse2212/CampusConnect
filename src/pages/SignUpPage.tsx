import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import logo from '../../public/logos/nwu_acronym.png'
import { useAuth } from '../components/AuthProvider'

function SignUpPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const role = useMemo(() => {
    const raw = (params.get('role') || 'student').toLowerCase()
    if (raw === 'guest' || raw === 'staff' || raw === 'student') return raw
    return 'student'
  }, [params])

  const identifierLabel = role === 'guest' ? 'Email' : role === 'staff' ? 'Staff Number' : 'Student Number'
  const identifierType = role === 'guest' ? 'email' : 'text'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const form = new FormData(e.target as HTMLFormElement)
      const name = (form.get('name') as string)?.trim()
      const identifier = (form.get('identifier') as string)?.trim()
      const password = (form.get('password') as string) || ''
      if (!name || !identifier || !password) {
        setError('Please fill in all required fields')
        setSubmitting(false)
        return
      }
      const args: { role: 'student' | 'guest' | 'admin' | 'staff', name: string, identifier: string, password: string, email?: string } = {
        role: role as any,
        name,
        identifier,
        password,
      }
      await signUp(args)
      navigate('/app')
    } catch (err) {
      setError('Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center h-svh bg-[#6c3d91]">
      <div className="flex flex-col items-center gap-4">
        <img src={logo} alt="logo" className="w-60 h-16" />
        <p className="text-white text-2xl font-[400] uppercase">It all starts here</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#ffffff] w-[400px] rounded-md p-4">
          <h3 className="text-2xl font-semibold text-center">Sign up as {role}</h3>
          <div className="grid grid-cols-1 gap-4">
            <fieldset className="flex flex-col gap-1">
              <label className="text-sm text-[#6b6b6b]">Full Name</label>
              <input name="name" type="text" placeholder="Full Name" className="px-4 py-2 rounded-md border border-[#e2e2e2]" autoFocus />
            </fieldset>
            <fieldset className="flex flex-col gap-1">
              <label className="text-sm text-[#6b6b6b]">{identifierLabel}</label>
              <input name="identifier" type={identifierType} placeholder={identifierLabel} className="px-4 py-2 rounded-md border border-[#e2e2e2]" />
            </fieldset>
            <fieldset className="flex flex-col gap-1">
              <label className="text-sm text-[#6b6b6b]">Password</label>
              <input name="password" type="password" placeholder="Password" className="px-4 py-2 rounded-md border border-[#e2e2e2]" />
            </fieldset>
          </div>
          {error && <div className="text-sm text-red-600 text-center">{error}</div>}
          <div className="grid grid-cols-1 gap-4">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-[#794c9c] text-white disabled:opacity-60">{submitting ? 'Registering…' : 'Create Account'}</button>
          </div>
          <p className="text-sm text-center">Want to choose a different role? <Link to="/auth/register" className="text-blue-500">Back</Link></p>
        </form>
      </div>
    </div>
  )
}

export default SignUpPage


