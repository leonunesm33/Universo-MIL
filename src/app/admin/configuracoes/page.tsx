import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { IdentidadeTab } from './IdentidadeTab'
import { LojasTab } from './LojasTab'

const GRUPOS = [
  {
    role: 'COLABORADOR',
    label: 'Colaborador',
    description: 'Acesso à plataforma de aprendizado, POP, pesquisas e checklist',
    permissions: ['Cursos', 'POP', 'Pesquisa de Clima', 'Checklist', 'NPS Líderes', 'Perfil'],
  },
  {
    role: 'SUPERVISAO',
    label: 'Supervisão',
    description: 'Tudo do Colaborador + visão da equipe filtrada por loja',
    permissions: ['Cursos', 'POP', 'Pesquisa de Clima', 'Checklist', 'NPS Líderes', 'Minha Equipe', 'Perfil'],
  },
  {
    role: 'GERENTE',
    label: 'Gerente',
    description: 'Tudo do Colaborador + acesso a POP e pesquisas de loja',
    permissions: ['Cursos', 'POP', 'Pesquisa de Clima', 'NPS Líderes', 'Perfil'],
  },
  {
    role: 'ADMIN',
    label: 'Administrador',
    description: 'Acesso total — todas as funcionalidades admin e de aluno',
    permissions: ['Tudo'],
  },
]

type Tab = 'identidade' | 'lojas' | 'grupos'

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const tab = (params.tab as Tab) ?? 'identidade'

  const stores =
    tab === 'lojas'
      ? await prisma.store.findMany({
          orderBy: { name: 'asc' },
          include: { _count: { select: { users: true } } },
        })
      : []

  const tabs: { key: Tab; label: string }[] = [
    { key: 'identidade', label: 'Identidade' },
    { key: 'lojas', label: 'Lojas' },
    { key: 'grupos', label: 'Grupos' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-sm text-slate-500 mt-1">Identidade visual, lojas e grupos de usuários</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/configuracoes?tab=${t.key}`}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-brand text-brand bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'identidade' && <IdentidadeTab />}

      {tab === 'lojas' && <LojasTab stores={stores} />}

      {tab === 'grupos' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-w-4xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-left bg-slate-50">
                <th className="px-4 py-3 font-medium">Grupo</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Acessos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {GRUPOS.map((g) => (
                <tr key={g.role} className="align-top">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{g.label}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs">{g.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {g.permissions.map((p) => (
                        <span
                          key={p}
                          className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
