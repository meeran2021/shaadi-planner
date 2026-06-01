'use client'

interface Props {
  spent:    number
  max:      number
  height?:  number
}

export function BudgetProgressBar({ spent, max, height = 8 }: Props) {
  const pct     = max > 0 ? Math.min((spent / max) * 100, 100) : 0
  const overBudget = spent > max
  const nearLimit  = pct >= 80 && !overBudget

  const fillColor = overBudget ? '#B91C1C'
    : nearLimit   ? '#C27A00'
    : '#2D7A46'

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        height:       height,
        borderRadius: height,
        background:   '#F3F4F6',
        overflow:     'hidden',
      }}>
        <div style={{
          height:       '100%',
          width:        `${pct}%`,
          background:   fillColor,
          borderRadius: height,
          transition:   'width 500ms ease',
        }} />
      </div>
    </div>
  )
}
