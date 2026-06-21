'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface StudentDonutChartProps {
  last7: number
  last30: number
  last90: number
}

const COLORS = ['#EC55B5', '#f493cf', '#f9cce8']

export function StudentDonutChart({ last7, last30, last90 }: StudentDonutChartProps) {
  const segments = [
    { name: 'Últimos 7 dias', value: last7, color: COLORS[0] },
    { name: '8 a 30 dias', value: Math.max(0, last30 - last7), color: COLORS[1] },
    { name: '31 a 90 dias', value: Math.max(0, last90 - last30), color: COLORS[2] },
  ]

  const hasData = last90 > 0

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-36 h-36 shrink-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {segments.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full rounded-full border-[12px] border-slate-100 flex items-center justify-center">
            <span className="text-xl font-bold text-slate-300">0</span>
          </div>
        )}
        {hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-800">{last90}</span>
            <span className="text-[10px] text-slate-400 leading-none mt-0.5">alunos</span>
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <div className="flex items-center justify-between gap-3 min-w-0">
              <span className="text-xs text-slate-500 truncate">{s.name}</span>
              <span className="text-xs font-bold text-slate-700 shrink-0">{s.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
