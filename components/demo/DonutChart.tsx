'use client'

interface Segment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: Segment[]
  size?: number
  centerLabel?: string
  showLegend?: boolean
}

export default function DonutChart({
  segments,
  size = 140,
  centerLabel = 'total',
  showLegend = true,
}: DonutChartProps) {
  const total = segments.reduce((s, d) => s + d.value, 0)
  const gap = 1.5 // degrees between segments

  let cumulative = 0
  const parts = segments.map((seg) => {
    const pct = seg.value / total
    const startDeg = cumulative * 360
    cumulative += pct
    const endDeg = cumulative * 360
    return { ...seg, startDeg: startDeg + gap / 2, endDeg: endDeg - gap / 2, pct }
  })

  const hole = size * 0.36

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {/* Chart */}
      <div
        className="relative flex-shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          background: buildConic(parts),
        }}
      >
        {/* Hole */}
        <div
          className="absolute bg-dark-900 rounded-full flex flex-col items-center justify-center"
          style={{
            width: hole * 2,
            height: hole * 2,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span className="text-2xl font-bold text-white leading-none">{total}</span>
          <span className="text-[10px] text-dark-400 mt-0.5">{centerLabel}</span>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-col gap-2.5 min-w-[130px]">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: seg.color }}
              />
              <span className="text-xs text-dark-300 flex-1 leading-tight">{seg.label}</span>
              <span className="text-xs font-bold text-white ml-1">{seg.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function buildConic(parts: { startDeg: number; endDeg: number; color: string }[]) {
  const stops = parts.map((p) => `${p.color} ${p.startDeg.toFixed(1)}deg ${p.endDeg.toFixed(1)}deg`)
  return `conic-gradient(${stops.join(', ')})`
}
