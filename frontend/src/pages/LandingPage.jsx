import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import hero from '../assets/hero.png'

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
    // trigger entry animation on word change
    setAnim(true)
    const id = setTimeout(() => setAnim(false), 380)
    return () => clearTimeout(id)
  }, [idx])

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Decorative floating blobs */}
      <div className="float-blob" style={{ width: 320, height: 240, background: 'rgba(99,102,241,0.12)', left: -40, top: -20 }} />
      <div className="float-blob" style={{ width: 240, height: 200, background: 'rgba(16,185,129,0.08)', right: -20, top: 80, animationDelay: '1.2s' }} />
      <div className="float-blob" style={{ width: 180, height: 160, background: 'rgba(236,72,153,0.06)', left: '10%', bottom: -30, animationDelay: '0.6s' }} />

      <header className="w-full py-6 px-8 flex items-center justify-between z-10">
        <div className="text-xl font-bold">MemCommit</div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/auth')} className="text-sm text-zinc-600">Log in</button>
          <Button onClick={() => navigate('/auth')} variant="primary" className="cta-pulse">Try for free</Button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 px-8 py-16 max-w-6xl mx-auto z-10">
        <section className="relative">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 hero-animate-in">
            AI memory for <span className="text-indigo-600">trusted</span> assistants
          </h1>

          <div className="text-2xl lg:text-3xl font-semibold mb-4 hero-animate-in" style={{ animationDelay: '120ms' }}>
            <span className="rotating-word">
              <span className={"rotating-word-current " + (anim ? 'enter' : '')}>{rotating[idx]}</span>
            </span>
            <span className="ml-3 text-zinc-700">memories for your assistant</span>
          </div>

          <p className="text-zinc-600 mb-6 hero-animate-in" style={{ animationDelay: '220ms' }}>
            Keep assistant interactions personal, private, and auditable — with user-first memory controls built-in.
          </p>

          <div className="flex items-center gap-4 hero-animate-in" style={{ animationDelay: '220ms' }}>
            <Button onClick={() => navigate('/auth')} size="lg" className="cta-pulse">Try for free — it's free</Button>
            <a href="#features" className="text-sm text-zinc-600">Learn more →</a>
          </div>
        </section>

        <section className="flex items-center justify-center relative">
          <div className="w-full max-w-md shadow-lg rounded-lg overflow-hidden hero-animate-in" style={{ animationDelay: '360ms' }}>
            <img src={hero} alt="hero" className="w-full h-auto" />
          </div>
        </section>
      </main>

      <section id="features" className="border-t py-12 px-8 bg-zinc-50 z-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold">Personalized</h3>
            <p className="text-sm text-zinc-600">Memories adapt to your preferences and context.</p>
          </div>
          <div>
            <h3 className="font-semibold">Private by default</h3>
            <p className="text-sm text-zinc-600">You control what gets stored and shared.</p>
          </div>
          <div>
            <h3 className="font-semibold">Auditable</h3>
            <p className="text-sm text-zinc-600">Review and revoke memory at any time.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
