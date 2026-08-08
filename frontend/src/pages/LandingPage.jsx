import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import Spline from '@splinetool/react-spline'

export default function LandingPage() {
  const navigate = useNavigate()
  const rotating = ["personal", "private", "contextual", "auditable"]
  const [idx, setIdx] = useState(0)
  const [anim, setAnim] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % rotating.length), 2500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setAnim(true)
    const id = setTimeout(() => setAnim(false), 380)
    return () => clearTimeout(id)
  }, [idx])

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      {/* Interactive 3D Background */}
      <div className="absolute inset-0 z-0">
        <Spline scene="https://prod.spline.design/PudRwSHGKzHDsuIM/scene.splinecode" />
      </div>

      <header className="w-full py-6 px-8 flex items-center justify-between z-10 pointer-events-none">
        <div className="text-xl font-bold text-zinc-900 pointer-events-auto">MemCommit</div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={() => navigate('/auth')} className="text-sm font-medium text-zinc-700 hover:text-zinc-900">Log in</button>
          <Button onClick={() => navigate('/auth')} variant="primary" className="cta-pulse shadow-md">Try for free</Button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 px-8 py-16 max-w-6xl mx-auto z-10 pointer-events-none">
        <section className="relative pointer-events-auto">
          <h1
            className="text-5xl lg:text-6xl font-extrabold mb-5 hero-animate-in tracking-tight leading-[1.05]"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              textShadow: '0 4px 24px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)'
            }}
          >
            <span className="text-zinc-900/90">AI memory for </span>
            <span
              className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent"
              style={{ fontFamily: "'Playfair Display', 'Brush Script MT'" }}
            >
               trusted
            </span>
            <span className="text-zinc-900/90"> assistants</span>
          </h1>

          <div
            className="inline-flex items-center text-lg lg:text-xl font-semibold mb-6 hero-animate-in bg-black/70 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-white/10"
            style={{ animationDelay: '120ms' }}
          >
            <span className="rotating-word">
              <span className={"rotating-word-current text-indigo-400 " + (anim ? 'enter' : '')}>{rotating[idx]}</span>
            </span>
            <span className="ml-2 text-white">memories for your assistant</span>
          </div>

          <p className="text-zinc-600 mb-6 hero-animate-in text-lg font-medium" style={{ animationDelay: '220ms' }}>
            Keep assistant interactions personal, private, and auditable — with user-first memory controls built-in.
          </p>

          <div className="flex items-center gap-4 hero-animate-in" style={{ animationDelay: '220ms' }}>
            <Button onClick={() => navigate('/auth')} size="lg" className="cta-pulse shadow-md">Try for free — it's free</Button>
            <a href="#features" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">Learn more →</a>
          </div>
        </section>
      </main>

      <section id="features" className="border-t border-white/10 py-12 px-8 bg-black/40 backdrop-blur-sm z-10 pointer-events-auto">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <div>
            <h3 className="font-semibold text-white">Personalized</h3>
            <p className="text-sm text-zinc-300">Memories adapt to your preferences and context.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Private by default</h3>
            <p className="text-sm text-zinc-300">You control what gets stored and shared.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Auditable</h3>
            <p className="text-sm text-zinc-300">Review and revoke memory at any time.</p>
          </div>
        </div>
      </section>
    </div>
  )
}