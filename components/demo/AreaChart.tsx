'use client'

interface AreaData {
  label: string
  value: number
}

interface AreaChartProps {
  data: AreaData[]
  height?: number
  color?: string
}

function smooth(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`
  }
  return d
}

export default function AreaChart({
  data,
  height = 140,
  color = '#C9A84C',
}: AreaChartProps) {
  const W = 400
  const H = height
  const PADB = 28
  const max = Math.max(...data.map(d => d.value)) * 1.15
  const min = Math.min(...data.map(d => d.value)) * 0.85

  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((d.value - min) / (max - min)) * H,
  }))

  const linePath = smooth(pts)
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x},${H} L ${pts[0].x},${H} Z`

  const gradId = `areaGrad_${color.replace('#', '')}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H + PADB}`}
      className="w-full"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <line
          key={pct}
          x1={0} y1={H * (1 - pct)}
          x2={W} y2={H * (1 - pct)}
          stroke="#2a2a2a"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {pts.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r="4"
          fill="#0d0d0d"
          stroke={color}
          strokeWidth="2"
        />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={pts[i].x}
          y={H + 18}
          textAnchor="middle"
          fill="#555"
          fontSize="11"
          fontFamily="system-ui"
        >
          {d.label}
        </text>
      ))}
    </svg>
  )
}
