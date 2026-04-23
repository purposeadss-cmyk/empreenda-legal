'use client'

interface BarData {
  label: string
  value: number
}

interface BarChartProps {
  data: BarData[]
  height?: number
  showValues?: boolean
  accentColor?: string
}

export default function BarChart({
  data,
  height = 160,
  showValues = true,
  accentColor = '#C9A84C',
}: BarChartProps) {
  const max = Math.max(...data.map(d => d.value))
  const W = 420
  const H = height
  const PAD_X = 8
  const barW = (W - PAD_X * (data.length + 1)) / data.length

  const gradId = `barGrad_${accentColor.replace('#', '')}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 36}`}
      className="w-full"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <line
          key={pct}
          x1={0} y1={H * (1 - pct)}
          x2={W} y2={H * (1 - pct)}
          stroke="#2a2a2a"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = Math.max((d.value / max) * H, 4)
        const x = PAD_X + i * (barW + PAD_X)
        const y = H - barH

        return (
          <g key={i}>
            {/* Bar shadow */}
            <rect
              x={x + 2} y={y + 2}
              width={barW} height={barH}
              rx="5"
              fill="rgba(0,0,0,0.4)"
            />
            {/* Bar */}
            <rect
              x={x} y={y}
              width={barW} height={barH}
              rx="5"
              fill={`url(#${gradId})`}
              className="transition-opacity duration-200 hover:opacity-80"
            />
            {/* Value label */}
            {showValues && (
              <text
                x={x + barW / 2}
                y={y - 7}
                textAnchor="middle"
                fill={accentColor}
                fontSize="11"
                fontWeight="700"
                fontFamily="system-ui"
              >
                {d.value}
              </text>
            )}
            {/* X-axis label */}
            <text
              x={x + barW / 2}
              y={H + 20}
              textAnchor="middle"
              fill="#666"
              fontSize="11"
              fontFamily="system-ui"
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
