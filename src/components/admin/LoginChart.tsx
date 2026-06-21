'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface LoginChartProps {
  data: { date: string; count: number }[]
  summary: { days1: number; days7: number; days30: number }
}

export function LoginChart({ data, summary }: LoginChartProps) {
  return (
    <div className="flex gap-4 items-stretch">
      <div className="flex-1 min-w-0">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-slate-400">
            Sem dados de login nos últimos 30 dias
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#3b82f6' }}
                labelStyle={{ color: '#475569', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#loginGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="shrink-0 w-24 flex flex-col justify-around border-l border-slate-100 pl-4">
        <div>
          <div className="text-xl font-bold text-blue-600">{summary.days30}</div>
          <div className="text-[11px] text-slate-400">30 dias</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-500">{summary.days7}</div>
          <div className="text-[11px] text-slate-400">7 dias</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-400">{summary.days1}</div>
          <div className="text-[11px] text-slate-400">1 dia</div>
        </div>
      </div>
    </div>
  )
}
