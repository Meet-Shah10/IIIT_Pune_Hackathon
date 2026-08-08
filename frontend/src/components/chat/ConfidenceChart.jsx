import { useState, useEffect, useRef, useCallback } from 'react'
import { TrendingUp, X, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../../lib/api'

// Pure SVG line + area chart — no dependencies
function LineChart({ series }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  if (!series || series.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-zinc-400">
        Send a message to start tracking confidence
      </div>
    )
  }

  const W = 600
  const H = 140
  const PAD = { top: 12, right: 16, bottom: 28, left: 38 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const minScore = Math.max(0, Math.min(...series.map(d => d.confidenceScore)) - 10)
  const maxScore = 100

  const xScale = i => PAD.left + (series.length === 1 ? chartW / 2 : (i / (series.length - 1)) * chartW)
  const yScale = v => PAD.top + chartH - ((v - minScore) / (maxScore - minScore)) * chartH

  const points = series.map((d, i) => ({ x: xScale(i), y: yScale(d.confidenceScore), ...d }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = [
    ...points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${PAD.top + chartH}`,
    `L ${points[0].x} ${PAD.top + chartH}`,
    'Z'
  ].join(' ')

  const yTicks = [0, 25, 50, 75, 100]

  const colorForScore = s => s >= 80 ? '#a855f7' : s >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 140 }}
        onMouseMove={e => {
          const rect = svgRef.current.getBoundingClientRect()
          const mx = ((e.clientX - rect.left) / rect.width) * W
          let closest = null, minDist = Infinity
          points.forEach(p => {
            const d = Math.abs(p.x - mx)
            if (d < minDist) { minDist = d; closest = p }
          })
          if (closest && minDist < 30) setTooltip(closest)
          else setTooltip(null)
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Y grid lines */}
        {yTicks.map(t => (
          <g key={t}>
            <line
              x1={PAD.left} y1={yScale(t)} x2={PAD.left + chartW} y2={yScale(t)}
              stroke="#f1f5f9" strokeWidth={1}
            />
            <text x={PAD.left - 6} y={yScale(t) + 4} fontSize={9} fill="#94a3b8" textAnchor="end">{t}%</text>
          </g>
        ))}

        {/* Area fill */}
        <defs>
          <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#confGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#a855f7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r={tooltip?.index === p.index ? 5 : 3.5}
            fill={colorForScore(p.confidenceScore)}
            stroke="white" strokeWidth={1.5}
            style={{ transition: 'r 0.15s' }}
          />
        ))}

        {/* X axis labels: show Turn N */}
        {points.map((p, i) => (
          (series.length <= 8 || i % Math.ceil(series.length / 8) === 0 || i === series.length - 1) && (
            <text key={i} x={p.x} y={H - 6} fontSize={9} fill="#94a3b8" textAnchor="middle">
              T{p.index}
            </text>
          )
        ))}

        {/* Tooltip crosshair */}
        {tooltip && (
          <>
            <line
              x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + chartH}
              stroke="#a855f7" strokeWidth={1} strokeDasharray="3,3" opacity={0.5}
            />
          </>
        )}
      </svg>

      {/* Hover tooltip bubble */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-zinc-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-20 border border-purple-500/30"
          style={{
            left: `${(tooltip.x / 600) * 100}%`,
            top: 4,
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap'
          }}
        >
          <span className="font-bold text-purple-300">{tooltip.confidenceScore}%</span>
          <span className="text-zinc-400 ml-1">certainty</span>
          {tooltip.preview && (
            <div className="text-zinc-400 mt-0.5 max-w-[180px] truncate">{tooltip.preview}…</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ConfidenceChart({ sessionId, messages }) {
  const [series, setSeries] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const latestScore = series.length > 0 ? series[series.length - 1].confidenceScore : null

  const fetchSeries = useCallback(async () => {
    if (!sessionId) return
    try {
      const data = await api.getConfidenceSeries(sessionId)
      setSeries(Array.isArray(data) ? data : [])
    } catch {}
  }, [sessionId])

  // Refetch every time a new assistant message comes in
  useEffect(() => {
    fetchSeries()
  }, [fetchSeries, messages?.length])

  const scoreColor = s => s == null ? 'text-zinc-400' : s >= 80 ? 'text-purple-600' : s >= 60 ? 'text-amber-500' : 'text-red-500'
  const barColor = s => s == null ? 'bg-zinc-200' : s >= 80 ? 'bg-purple-500' : s >= 60 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="w-full border-t border-zinc-100 bg-white/80 backdrop-blur-sm">
      {/* Header toggle bar */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-zinc-50/80 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
          <span className="text-xs font-semibold text-zinc-600 tracking-wide">AI CERTAINTY</span>
          {latestScore != null && (
            <div className="flex items-center gap-1.5">
              <div className="w-14 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(latestScore)}`}
                  style={{ width: `${latestScore}%` }}
                />
              </div>
              <span className={`text-xs font-bold ${scoreColor(latestScore)}`}>{latestScore}%</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400 group-hover:text-zinc-500 transition-colors">
            {series.length} turn{series.length !== 1 ? 's' : ''}
          </span>
          {isOpen
            ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            : <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />}
        </div>
      </button>

      {/* Expandable chart */}
      {isOpen && (
        <div className="px-5 pb-4 pt-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-zinc-400 tracking-wide uppercase">
              Confidence across {series.length} response{series.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-3 text-[9px] text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block"/>≥80%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>60–79%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>&lt;60%</span>
            </div>
          </div>
          <LineChart series={series} />
        </div>
      )}
    </div>
  )
}
