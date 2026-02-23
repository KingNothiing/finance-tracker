function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

const fallbackColors = ['#f4a261', '#2a9d8f', '#e76f51', '#264653', '#e9c46a']

export default function PieChart({ data }) {
  const total = data.reduce((sum, s) => sum + s.value, 0)
  if (!total) return null

  let current = 0
  return (
    <svg viewBox="0 0 200 200" width="200" height="200" aria-label="pie-chart">
      {data.map((slice, idx) => {
        const start = (current / total) * 360
        const angle = (slice.value / total) * 360
        const end = start + angle
        current += slice.value
        const d = describeArc(100, 100, 90, start, end)
        const fill = slice.color || fallbackColors[idx % fallbackColors.length]
        return <path key={slice.id || idx} d={d} fill={fill} data-testid="pie-slice" />
      })}
    </svg>
  )
}
