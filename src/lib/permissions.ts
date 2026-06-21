import type { AppRole } from '@/types/next-auth'

export const ROLES = {
  COLABORADOR: 'COLABORADOR',
  SUPERVISAO: 'SUPERVISAO',
  GERENTE: 'GERENTE',
  GESTAO: 'GESTAO',
  ADMIN: 'ADMIN',
} as const

export type Feature =
  | 'learning'          // painel de aprendizagem (cursos, aulas)
  | 'pop'               // POP — Procedimento Operacional Padrão
  | 'clima'             // Pesquisa de clima
  | 'checklist_answer'  // responder checklist de lojas
  | 'checklist_dash'    // ver dashboards de checklist
  | 'team_evolution'    // ver evolução de aprendizagem da equipe
  | 'admin_panel'       // painel admin completo (ADMIN only)
  | 'admin_analytics'   // Dashboard, Relatórios, Ranking (SUPERVISAO+)
  | 'nps'               // NPS / Satisfação da equipe

export const PERMISSIONS: Record<Feature, AppRole[]> = {
  learning:         ['COLABORADOR', 'SUPERVISAO', 'GERENTE', 'GESTAO', 'ADMIN'],
  clima:            ['COLABORADOR', 'SUPERVISAO', 'GERENTE', 'GESTAO', 'ADMIN'],
  pop:              ['SUPERVISAO', 'GERENTE', 'ADMIN'],
  checklist_answer: ['SUPERVISAO', 'GESTAO', 'ADMIN'],
  checklist_dash:   ['GESTAO', 'ADMIN'],
  team_evolution:   ['SUPERVISAO', 'GESTAO', 'ADMIN'],
  admin_panel:      ['ADMIN'],
  admin_analytics:  ['SUPERVISAO', 'GESTAO', 'ADMIN'],
  nps:              ['COLABORADOR', 'SUPERVISAO', 'GERENTE', 'GESTAO', 'ADMIN'],
}

export function can(role: AppRole, feature: Feature): boolean {
  return (PERMISSIONS[feature] as string[]).includes(role)
}

export function roleLabel(role: AppRole): string {
  const labels: Record<AppRole, string> = {
    COLABORADOR: 'Colaboradora',
    SUPERVISAO: 'Supervisão',
    GERENTE: 'Gerente',
    GESTAO: 'Gestão',
    ADMIN: 'Administrador',
  }
  return labels[role] ?? role
}
