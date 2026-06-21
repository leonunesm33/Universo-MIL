import { getDashboardMetrics } from '@/app/admin/actions/metrics'
import { LoginChart } from '@/components/admin/LoginChart'
import { StoreFilter } from '@/components/admin/StoreFilter'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }>
}) {
  const { storeId } = await searchParams

  const [metrics, stores] = await Promise.all([
    getDashboardMetrics(storeId),
    prisma.store.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const metricCards = [
    {
      label: 'Total de Alunos',
      value: metrics.totalStudents,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Ativos (7 dias)',
      value: metrics.activeStudents,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Aulas Concluídas',
      value: metrics.totalCompleted,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      color: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Cursos Publicados',
      value: metrics.publishedCourses,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
        </svg>
      ),
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Visão geral da plataforma</p>
        </div>
        <StoreFilter stores={stores} currentStoreId={storeId} />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className={`inline-flex p-2.5 rounded-lg ${card.color} mb-3`}>{card.icon}</div>
            <div className="text-3xl font-bold text-slate-800">{card.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Login chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Logins (últimos 30 dias)</h2>
        <LoginChart data={metrics.loginChartData} />
      </div>

      {/* Liked / Disliked lessons */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">👍 Aulas mais curtidas</h2>
          {metrics.topLikedLessons.length === 0 ? (
            <p className="text-sm text-slate-400">Sem dados ainda.</p>
          ) : (
            <div className="space-y-2">
              {metrics.topLikedLessons.map((lesson, i) => (
                <div key={lesson.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300 w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{lesson.title}</p>
                    <p className="text-xs text-slate-400">{lesson.courseName}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">+{lesson.likes}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">👎 Aulas menos curtidas</h2>
          {metrics.topDislikedLessons.length === 0 ? (
            <p className="text-sm text-slate-400">Sem dados ainda.</p>
          ) : (
            <div className="space-y-2">
              {metrics.topDislikedLessons.map((lesson, i) => (
                <div key={lesson.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300 w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{lesson.title}</p>
                    <p className="text-xs text-slate-400">{lesson.courseName}</p>
                  </div>
                  <span className="text-sm font-bold text-rose-600">-{lesson.dislikes}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course evolution */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Evolução por Curso</h2>
        </div>
        {metrics.courseProgress.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum curso publicado.</p>
        ) : (
          <div className="space-y-4">
            {metrics.courseProgress.map((course) => (
              <div key={course.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 truncate">{course.name}</span>
                  <span className="text-slate-400 shrink-0 ml-2">{course.avgCompletion}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-brand rounded-full h-2 transition-all"
                    style={{ width: `${course.avgCompletion}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {course.completedStudents}/{course.totalStudents} alunas completaram
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom row: checklist + clima + NPS */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Checklist score */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Score Geral — Checklists</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-brand">{metrics.checklistAvgScore}%</div>
            <div className="text-sm text-slate-500">
              Média de conformidade<br/>
              <span className="text-xs">{metrics.checklistResponseCount} avaliações · {metrics.checklistStoreCount} lojas</span>
            </div>
          </div>
          {metrics.checklistByStore.length > 0 && (
            <div className="mt-4 space-y-1">
              {metrics.checklistByStore.map((s, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-slate-600 truncate">{s.storeName ?? '—'}</span>
                  <span className={`font-bold ${s.avg >= 80 ? 'text-emerald-600' : s.avg >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {s.avg}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clima avg */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Pesquisa de Clima — Média</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-indigo-600">{metrics.climateAvg.toFixed(1)}</div>
            <div className="text-sm text-slate-500">de 5.0<br/><span className="text-xs">{metrics.climateResponseCount} respostas</span></div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
            <div className="bg-indigo-500 rounded-full h-2" style={{ width: `${(metrics.climateAvg / 5) * 100}%` }} />
          </div>
        </div>

        {/* NPS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Satisfação da Equipe (NPS)</h2>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${metrics.npsScore >= 50 ? 'text-emerald-600' : metrics.npsScore >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
              {metrics.npsScore > 0 ? '+' : ''}{metrics.npsScore}
            </div>
            <div className="text-sm text-slate-500">
              NPS<br/>
              <span className="text-xs">{metrics.npsPromoters} promotores · {metrics.npsDetractors} detratores</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent students */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Alunos Recentes</h2>
        {metrics.recentStudents.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum aluno cadastrado ainda.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {metrics.recentStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{s.name}</p>
                  <p className="text-xs text-slate-400 truncate">{s.email}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {s.lastAccessAt
                    ? `Acesso: ${new Date(s.lastAccessAt).toLocaleDateString('pt-BR')}`
                    : 'Nunca acessou'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
