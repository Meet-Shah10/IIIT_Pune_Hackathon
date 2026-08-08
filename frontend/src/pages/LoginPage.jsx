import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@example.com')

  const handleSubmit = (e) => {
    e.preventDefault()
    login(email, 'password')
    navigate('/app')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.1)_0%,_transparent_50%)] pointer-events-none" />
      
      <div className="w-full max-w-md card p-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-display text-2xl mb-2">MemCommit</h1>
          <p className="text-body text-sm">Negotiate your AI memory.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-label text-sm block">Email</label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="demo@example.com" 
              required
            />
          </div>
          <Button type="submit" className="w-full h-11">
            Access Terminal
          </Button>
        </form>
      </div>
    </div>
  )
}
