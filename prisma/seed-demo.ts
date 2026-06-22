/**
 * seed-demo.ts — Dados de demonstração para o vídeo de apresentação Universo Mil
 * Execute: npx tsx prisma/seed-demo.ts
 *
 * Contas criadas:
 *   admin@demo.com        / Demo@2024  (ADMIN)
 *   supervisora@demo.com  / Demo@2024  (SUPERVISAO, Loja Centro)
 *   colaboradora@demo.com / Demo@2024  (COLABORADOR, Loja Centro — para testes)
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const YT = (id: string, secs: number) => ({
  youtubeUrl: `https://www.youtube.com/watch?v=${id}`,
  durationSecs: secs,
})

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000)

async function main() {
  console.log('🎬 Seed de demonstração iniciado...\n')

  // ── LIMPEZA ────────────────────────────────────────────────────────────────
  await prisma.certificate.deleteMany()
  await prisma.nPSAnswer.deleteMany()
  await prisma.nPSResponse.deleteMany()
  await prisma.nPSLeader.deleteMany()
  await prisma.nPSQuestion.deleteMany()
  await prisma.nPSCampaign.deleteMany()
  await prisma.checklistAnswerItem.deleteMany()
  await prisma.checklistResponse.deleteMany()
  await prisma.checklistItem.deleteMany()
  await prisma.checklistTemplate.deleteMany()
  await prisma.climateAnswer.deleteMany()
  await prisma.climateResponse.deleteMany()
  await prisma.climateQuestion.deleteMany()
  await prisma.climateResearch.deleteMany()
  await prisma.pOPDocument.deleteMany()
  await prisma.loginLog.deleteMany()
  await prisma.studentNote.deleteMany()
  await prisma.assessmentResponse.deleteMany()
  await prisma.option.deleteMany()
  await prisma.question.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.like.deleteMany()
  await prisma.inviteToken.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.userCourse.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()
  await prisma.store.deleteMany()
  console.log('✅ Banco limpo')

  // ── LOJAS ──────────────────────────────────────────────────────────────────
  const storeCentro = await prisma.store.create({ data: { name: 'Loja Centro', code: 'CENTRO' } })
  const storeShopping = await prisma.store.create({ data: { name: 'Loja Shopping', code: 'SHOPPING' } })
  const storeNorte = await prisma.store.create({ data: { name: 'Loja Norte', code: 'NORTE' } })
  console.log('✅ 3 lojas criadas')

  // ── USUÁRIOS ───────────────────────────────────────────────────────────────
  const demoHash = await bcrypt.hash('Demo@2024', 10)
  const stdHash  = await bcrypt.hash('demo123', 10)

  const admin = await prisma.user.create({
    data: { name: 'Administradora', email: 'admin@demo.com', passwordHash: demoHash, role: 'ADMIN', lastAccessAt: daysAgo(0) },
  })
  const supervisora = await prisma.user.create({
    data: { name: 'Fernanda Carvalho', email: 'supervisora@demo.com', passwordHash: demoHash, role: 'SUPERVISAO', storeId: storeCentro.id, lastAccessAt: daysAgo(0) },
  })
  const gerente = await prisma.user.create({
    data: { name: 'Renata Campos', email: 'gerente@demo.com', passwordHash: stdHash, role: 'GERENTE', storeId: storeShopping.id, lastAccessAt: daysAgo(1) },
  })
  const colabDemoAcc = await prisma.user.create({
    data: { name: 'Colaboradora Demo', email: 'colaboradora@demo.com', passwordHash: demoHash, role: 'COLABORADOR', storeId: storeCentro.id, lastAccessAt: daysAgo(0) },
  })

  // 8 colaboradoras com nomes reais distribuídas nas lojas
  const colaboradoras = await Promise.all([
    prisma.user.create({ data: { name: 'Camila Oliveira',   email: 'camila.oliveira@demo.com',   passwordHash: stdHash, role: 'COLABORADOR', storeId: storeCentro.id,   lastAccessAt: daysAgo(1) } }),
    prisma.user.create({ data: { name: 'Larissa Santos',    email: 'larissa.santos@demo.com',    passwordHash: stdHash, role: 'COLABORADOR', storeId: storeCentro.id,   lastAccessAt: daysAgo(2) } }),
    prisma.user.create({ data: { name: 'Júlia Ferreira',    email: 'julia.ferreira@demo.com',    passwordHash: stdHash, role: 'COLABORADOR', storeId: storeShopping.id, lastAccessAt: daysAgo(1) } }),
    prisma.user.create({ data: { name: 'Beatriz Lima',      email: 'beatriz.lima@demo.com',      passwordHash: stdHash, role: 'COLABORADOR', storeId: storeShopping.id, lastAccessAt: daysAgo(3) } }),
    prisma.user.create({ data: { name: 'Gabriela Alves',    email: 'gabriela.alves@demo.com',    passwordHash: stdHash, role: 'COLABORADOR', storeId: storeShopping.id, lastAccessAt: daysAgo(4) } }),
    prisma.user.create({ data: { name: 'Isabela Rodrigues', email: 'isabela.rodrigues@demo.com', passwordHash: stdHash, role: 'COLABORADOR', storeId: storeNorte.id,    lastAccessAt: daysAgo(2) } }),
    prisma.user.create({ data: { name: 'Natália Costa',     email: 'natalia.costa@demo.com',     passwordHash: stdHash, role: 'COLABORADOR', storeId: storeNorte.id,    lastAccessAt: daysAgo(5) } }),
    prisma.user.create({ data: { name: 'Mariana Souza',     email: 'mariana.souza@demo.com',     passwordHash: stdHash, role: 'COLABORADOR', storeId: storeNorte.id,    lastAccessAt: daysAgo(6) } }),
  ])
  const allUsers = [admin, supervisora, gerente, colabDemoAcc, ...colaboradoras]
  console.log(`✅ ${allUsers.length} usuários criados`)

  // ── CURSO 1: MÓDULO DE BOAS-VINDAS ─────────────────────────────────────────
  const course1 = await prisma.course.create({
    data: {
      name: 'Módulo de Boas-Vindas',
      slug: 'modulo-boas-vindas',
      description: 'Bem-vinda à equipe MIL! Conheça nossa história, nossos valores e tudo que você precisa saber para começar com o pé direito.',
      status: 'PUBLISHED',
      order: 0,
    },
  })

  const c1m1 = await prisma.module.create({
    data: { courseId: course1.id, title: 'Módulo 1 — Integração e Cultura', slug: 'integracao-e-cultura', order: 0 },
  })
  const c1m1Lessons = await Promise.all([
    prisma.lesson.create({ data: { moduleId: c1m1.id, title: '1.1 — Bem-vinda à equipe MIL', slug: '11-bem-vinda-equipe', ...YT('dQw4w9WgXcQ', 213), type: 'VIDEO', order: 0, description: 'Uma calorosa boas-vindas de toda a equipe. Conheça quem somos e o que nos move.' } }),
    prisma.lesson.create({ data: { moduleId: c1m1.id, title: '1.2 — Nossa história e trajetória', slug: '12-nossa-historia', ...YT('9bZkp7q19f0', 252), type: 'VIDEO', order: 1, description: 'De onde viemos e para onde vamos. A história de uma marca que nasceu com propósito.' } }),
    prisma.lesson.create({ data: { moduleId: c1m1.id, title: '1.3 — Missão, Visão e Valores', slug: '13-missao-visao-valores', ...YT('OPf0YbXqDm0', 269), type: 'VIDEO', order: 2, description: 'Os pilares que guiam cada decisão e comportamento na MIL.' } }),
  ])

  const c1m2 = await prisma.module.create({
    data: { courseId: course1.id, title: 'Módulo 2 — Código de Cultura', slug: 'codigo-de-cultura', order: 1 },
  })
  await prisma.lesson.createMany({
    data: [
      { moduleId: c1m2.id, title: '2.1 — Nossos valores na prática', slug: '21-valores-na-pratica', ...YT('JGwWNGJdvx8', 264), type: 'VIDEO', order: 0, description: 'Como nossos valores se manifestam nas decisões, comportamentos e relacionamentos diários.' },
      { moduleId: c1m2.id, title: '2.2 — Como trabalhamos juntas', slug: '22-como-trabalhamos', ...YT('kJQP7kiw5Fk', 282), type: 'VIDEO', order: 1, description: 'Nossa metodologia de trabalho: colaboração, respeito e excelência.' },
      { moduleId: c1m2.id, title: '2.3 — Benefícios e políticas internas', slug: '23-politicas-internas', ...YT('YQHsXMglC9A', 295), type: 'VIDEO', order: 2, description: 'Jornada de trabalho, benefícios, banco de horas e tudo que você precisa saber sobre RH.' },
    ],
  })

  const c1m3 = await prisma.module.create({
    data: { courseId: course1.id, title: 'Módulo 3 — Primeiros Passos', slug: 'primeiros-passos', order: 2 },
  })
  await prisma.lesson.createMany({
    data: [
      { moduleId: c1m3.id, title: '3.1 — Conheça sua loja', slug: '31-conheca-sua-loja', ...YT('CevxZvSJLk8', 222), type: 'VIDEO', order: 0, description: 'Estrutura, organização e funcionamento da sua loja.' },
      { moduleId: c1m3.id, title: '3.2 — Sistemas e ferramentas', slug: '32-sistemas-ferramentas', ...YT('nfWlot6h_JM', 241), type: 'VIDEO', order: 1, description: 'PDV, controles e sistemas digitais que usamos no dia a dia.' },
      { moduleId: c1m3.id, title: '3.3 — Segurança e normas', slug: '33-seguranca-normas', ...YT('hT_nvWreIhg', 228), type: 'VIDEO', order: 2, description: 'Procedimentos de segurança, emergências e normas da loja.' },
    ],
  })
  console.log('✅ Curso 1 criado (3 módulos × 3 aulas)')

  // ── CURSO 2: ATENDIMENTO E VENDAS ──────────────────────────────────────────
  const course2 = await prisma.course.create({
    data: {
      name: 'Atendimento e Técnicas de Vendas',
      slug: 'atendimento-e-vendas',
      description: 'Desenvolva habilidades para encantar clientes, aumentar conversão e construir relacionamentos duradouros.',
      status: 'PUBLISHED',
      order: 1,
    },
  })

  const c2m1 = await prisma.module.create({
    data: { courseId: course2.id, title: 'Módulo 1 — Excelência no Atendimento', slug: 'excelencia-no-atendimento', order: 0 },
  })
  const c2m1Lessons = await Promise.all([
    prisma.lesson.create({ data: { moduleId: c2m1.id, title: '1.1 — O cliente no centro de tudo', slug: '11-cliente-no-centro', ...YT('pRpeEdMmmQ0', 228), type: 'VIDEO', order: 0, description: 'Por que colocar a experiência da cliente acima de qualquer meta.' } }),
    prisma.lesson.create({ data: { moduleId: c2m1.id, title: '1.2 — As etapas do atendimento', slug: '12-etapas-atendimento', ...YT('y6Sxv-sUYtM', 187), type: 'VIDEO', order: 1, description: 'Do primeiro olhar ao pós-venda: como conduzir cada etapa com cuidado.' } }),
    prisma.lesson.create({ data: { moduleId: c2m1.id, title: '1.3 — Lidando com objeções e reclamações', slug: '13-objecoes-reclamacoes', ...YT('WA4iX5D9Z64', 243), type: 'VIDEO', order: 2, description: 'Transforme objeções em oportunidades e reclamações em fidelização.' } }),
  ])

  const c2m2 = await prisma.module.create({
    data: { courseId: course2.id, title: 'Módulo 2 — Técnicas de Vendas', slug: 'tecnicas-de-vendas', order: 1 },
  })
  await prisma.lesson.createMany({
    data: [
      { moduleId: c2m2.id, title: '2.1 — Escuta ativa e diagnóstico da cliente', slug: '21-escuta-ativa', ...YT('60ItHLz5WEA', 228), type: 'VIDEO', order: 0, description: 'Entenda o que a cliente realmente quer antes de oferecer qualquer produto.' },
      { moduleId: c2m2.id, title: '2.2 — Venda consultiva MIL', slug: '22-venda-consultiva', ...YT('L_jWHffIx5E', 356), type: 'VIDEO', order: 1, description: 'Nossa abordagem exclusiva de venda consultiva focada em resultado para a cliente.' },
      { moduleId: c2m2.id, title: '2.3 — Upsell e cross-sell sem forçar', slug: '23-upsell-crosssell', ...YT('dQw4w9WgXcQ', 213), type: 'VIDEO', order: 2, description: 'Como aumentar o ticket médio de forma natural e genuína.' },
    ],
  })

  const c2m3 = await prisma.module.create({
    data: { courseId: course2.id, title: 'Módulo 3 — Relacionamento e Fidelização', slug: 'relacionamento-fidelizacao', order: 2 },
  })
  await prisma.lesson.createMany({
    data: [
      { moduleId: c2m3.id, title: '3.1 — Construindo vínculos com clientes', slug: '31-construindo-vinculos', ...YT('9bZkp7q19f0', 252), type: 'VIDEO', order: 0 },
      { moduleId: c2m3.id, title: '3.2 — Pós-venda e fidelização', slug: '32-pos-venda', ...YT('OPf0YbXqDm0', 269), type: 'VIDEO', order: 1 },
      { moduleId: c2m3.id, title: '3.3 — Indicadores de satisfação', slug: '33-indicadores-satisfacao', ...YT('JGwWNGJdvx8', 264), type: 'VIDEO', order: 2 },
    ],
  })
  console.log('✅ Curso 2 criado (3 módulos × 3 aulas)')

  // ── AVALIAÇÕES ─────────────────────────────────────────────────────────────
  const av1 = await prisma.assessment.create({
    data: {
      moduleId: c1m1.id,
      title: 'Avaliação — Integração e Cultura',
      type: 'COMMON',
      status: 'ACTIVE',
      passingScore: 70,
      questions: {
        create: [
          { text: 'Qual é o principal objetivo do módulo de boas-vindas?', type: 'SINGLE', order: 0,
            options: { create: [
              { text: 'Apresentar a história, cultura e valores da empresa', isCorrect: true, order: 0 },
              { text: 'Ensinar técnicas avançadas de vendas', isCorrect: false, order: 1 },
              { text: 'Configurar os sistemas de PDV', isCorrect: false, order: 2 },
              { text: 'Treinar exclusivamente habilidades técnicas', isCorrect: false, order: 3 },
            ]}},
          { text: 'O que representa a missão da empresa?', type: 'SINGLE', order: 1,
            options: { create: [
              { text: 'O propósito maior que guia todas as decisões e ações', isCorrect: true, order: 0 },
              { text: 'A meta de faturamento do trimestre', isCorrect: false, order: 1 },
              { text: 'O manual de uniformes e apresentação pessoal', isCorrect: false, order: 2 },
              { text: 'O horário de funcionamento das lojas', isCorrect: false, order: 3 },
            ]}},
          { text: 'Como os valores da empresa devem se manifestar no trabalho?', type: 'SINGLE', order: 2,
            options: { create: [
              { text: 'Nas decisões, comportamentos e relacionamentos diários', isCorrect: true, order: 0 },
              { text: 'Apenas em documentos e comunicados oficiais', isCorrect: false, order: 1 },
              { text: 'Somente nas reuniões mensais de equipe', isCorrect: false, order: 2 },
              { text: 'No layout e decoração da loja', isCorrect: false, order: 3 },
            ]}},
          { text: 'Qual canal utilizar para dúvidas sobre benefícios e políticas de RH?', type: 'SINGLE', order: 3,
            options: { create: [
              { text: 'O departamento de RH da empresa', isCorrect: true, order: 0 },
              { text: 'As redes sociais da marca', isCorrect: false, order: 1 },
              { text: 'Os clientes da loja', isCorrect: false, order: 2 },
              { text: 'Os fornecedores de produtos', isCorrect: false, order: 3 },
            ]}},
          { text: 'O que significa trabalhar com propósito na MIL?', type: 'SINGLE', order: 4,
            options: { create: [
              { text: 'Agir com intenção, cuidado e alinhamento com os valores da marca', isCorrect: true, order: 0 },
              { text: 'Focar apenas em bater as metas individuais', isCorrect: false, order: 1 },
              { text: 'Seguir regras apenas quando conveniente', isCorrect: false, order: 2 },
              { text: 'Trabalhar o maior número de horas possível', isCorrect: false, order: 3 },
            ]}},
        ],
      },
    },
  })

  const av2 = await prisma.assessment.create({
    data: {
      moduleId: c2m1.id,
      title: 'Avaliação — Excelência no Atendimento',
      type: 'COMMON',
      status: 'ACTIVE',
      passingScore: 80,
      questions: {
        create: [
          { text: 'Qual a primeira atitude ao recepcionar uma cliente que entra na loja?', type: 'SINGLE', order: 0,
            options: { create: [
              { text: 'Cumprimentar com sorriso, olhar nos olhos e se colocar à disposição', isCorrect: true, order: 0 },
              { text: 'Continuar a tarefa que estava fazendo antes de abordá-la', isCorrect: false, order: 1 },
              { text: 'Solicitar o CPF para identificação imediata', isCorrect: false, order: 2 },
              { text: 'Aguardar ela se aproximar e pedir ajuda espontaneamente', isCorrect: false, order: 3 },
            ]}},
          { text: 'Como lidar corretamente com uma cliente insatisfeita?', type: 'SINGLE', order: 1,
            options: { create: [
              { text: 'Ouvir com atenção, reconhecer o sentimento e buscar solução imediata', isCorrect: true, order: 0 },
              { text: 'Chamar outra colaboradora para assumir o atendimento', isCorrect: false, order: 1 },
              { text: 'Argumentar explicando por que ela está errada', isCorrect: false, order: 2 },
              { text: 'Informar que a política da loja não permite negociações', isCorrect: false, order: 3 },
            ]}},
          { text: 'Qual o prazo máximo para responder mensagens no WhatsApp comercial durante o expediente?', type: 'SINGLE', order: 2,
            options: { create: [
              { text: 'Até 2 horas durante o horário de funcionamento da loja', isCorrect: true, order: 0 },
              { text: 'Até 24 horas corridas', isCorrect: false, order: 1 },
              { text: 'Não há prazo mínimo definido pela empresa', isCorrect: false, order: 2 },
              { text: 'Apenas no próximo dia útil', isCorrect: false, order: 3 },
            ]}},
          { text: 'O que fazer quando um produto solicitado está em falta no estoque?', type: 'SINGLE', order: 3,
            options: { create: [
              { text: 'Oferecer alternativa similar e verificar o prazo de reposição', isCorrect: true, order: 0 },
              { text: 'Informar simplesmente que o produto não está disponível', isCorrect: false, order: 1 },
              { text: 'Pedir para a cliente retornar amanhã sem mais informações', isCorrect: false, order: 2 },
              { text: 'Transferir o contato para a gerência sem explicação', isCorrect: false, order: 3 },
            ]}},
          { text: 'Como conduzir o fechamento de uma venda de forma eficaz?', type: 'SINGLE', order: 4,
            options: { create: [
              { text: 'Resumir os benefícios escolhidos e confirmar a decisão da cliente com naturalidade', isCorrect: true, order: 0 },
              { text: 'Pressionar para uma decisão rápida antes que ela mude de ideia', isCorrect: false, order: 1 },
              { text: 'Oferecer desconto imediato sem verificar margem', isCorrect: false, order: 2 },
              { text: 'Solicitar aprovação da supervisora antes de finalizar qualquer venda', isCorrect: false, order: 3 },
            ]}},
        ],
      },
    },
  })
  console.log('✅ 2 avaliações criadas')

  // ── MATRÍCULAS ─────────────────────────────────────────────────────────────
  const enrollData = allUsers.flatMap((u) => [
    { userId: u.id, courseId: course1.id },
    { userId: u.id, courseId: course2.id },
  ])
  await prisma.userCourse.createMany({ data: enrollData })
  console.log('✅ Matrículas criadas')

  // ── PROGRESSO ──────────────────────────────────────────────────────────────
  // supervisora: Módulo 1 do Curso 1 completo (para mostrar card de avaliação desbloqueada)
  await prisma.lessonProgress.createMany({
    data: c1m1Lessons.map((l) => ({
      userId: supervisora.id, lessonId: l.id, watchedSecs: l.durationSecs ?? 0,
      completed: true, completedAt: daysAgo(3),
    })),
  })
  // supervisora: progresso parcial no Módulo 1 do Curso 2
  await prisma.lessonProgress.createMany({
    data: c2m1Lessons.slice(0, 2).map((l) => ({
      userId: supervisora.id, lessonId: l.id, watchedSecs: l.durationSecs ?? 0,
      completed: true, completedAt: daysAgo(1),
    })),
  })

  // colabDemoAcc: módulo 1 do curso 1 completo
  await prisma.lessonProgress.createMany({
    data: c1m1Lessons.map((l) => ({
      userId: colabDemoAcc.id, lessonId: l.id, watchedSecs: l.durationSecs ?? 0,
      completed: true, completedAt: daysAgo(5),
    })),
  })

  // colaboradoras: progresso variado
  const progressVariado: { userId: string; lessonId: string; watchedSecs: number; completed: boolean; completedAt: Date | null }[] = []
  for (const [i, user] of colaboradoras.entries()) {
    const numCompleted = 2 + (i % 5)
    const lessons = [...c1m1Lessons, ...c2m1Lessons].slice(0, numCompleted)
    for (const l of lessons) {
      progressVariado.push({
        userId: user.id, lessonId: l.id, watchedSecs: l.durationSecs ?? 0,
        completed: true, completedAt: daysAgo(i + 1),
      })
    }
  }
  if (progressVariado.length > 0) {
    await prisma.lessonProgress.createMany({ data: progressVariado })
  }
  console.log('✅ Progresso criado')

  // ── CERTIFICADOS (supervisora) ─────────────────────────────────────────────
  await prisma.certificate.create({
    data: { userId: supervisora.id, type: 'MODULE', moduleId: c1m1.id, issuedAt: daysAgo(3) },
  })
  await prisma.certificate.create({
    data: { userId: supervisora.id, type: 'COURSE', courseId: course1.id, issuedAt: daysAgo(2) },
  })
  await prisma.certificate.create({
    data: { userId: colabDemoAcc.id, type: 'MODULE', moduleId: c1m1.id, issuedAt: daysAgo(4) },
  })
  console.log('✅ Certificados criados')

  // ── LIKES ──────────────────────────────────────────────────────────────────
  const firstLesson = c1m1Lessons[0]
  const secondLesson = c1m1Lessons[1]
  const thirdLesson = c2m1Lessons[0]

  await prisma.like.createMany({
    data: [
      ...colaboradoras.slice(0, 5).map((u) => ({ userId: u.id, lessonId: firstLesson.id, type: 'LIKE' as const })),
      ...colaboradoras.slice(5).map((u) => ({ userId: u.id, lessonId: firstLesson.id, type: 'LIKE' as const })),
      { userId: supervisora.id, lessonId: firstLesson.id, type: 'LIKE' as const },
      { userId: supervisora.id, lessonId: secondLesson.id, type: 'LIKE' as const },
      ...colaboradoras.slice(0, 3).map((u) => ({ userId: u.id, lessonId: secondLesson.id, type: 'LIKE' as const })),
      ...colaboradoras.slice(0, 2).map((u) => ({ userId: u.id, lessonId: thirdLesson.id, type: 'LIKE' as const })),
      { userId: colaboradoras[3].id, lessonId: thirdLesson.id, type: 'DISLIKE' as const },
    ],
  })
  console.log('✅ Likes criados')

  // ── LOGS DE ACESSO (30 dias para o gráfico do dashboard) ─────────────────────
  type LogEntry = { userId: string; createdAt: Date }
  const loginData: LogEntry[] = []

  // Admin — acessa quase diariamente
  for (let d = 0; d < 30; d++) {
    if (d % 2 === 0 || d === 0) loginData.push({ userId: admin.id, createdAt: daysAgo(d) })
  }
  // Supervisora — acessa 5x/semana
  for (let d = 0; d < 30; d++) {
    if (d % 7 !== 0 && d % 7 !== 6) loginData.push({ userId: supervisora.id, createdAt: daysAgo(d) })
  }
  // Colaboradoras — distribuição variada
  const patterns = [
    [0, 1, 3, 5, 7, 8, 10, 13, 14, 16, 20, 21, 25, 27],
    [0, 2, 4, 6, 9, 11, 15, 18, 22, 24, 28],
    [1, 3, 5, 8, 12, 14, 17, 19, 23, 26, 29],
    [0, 4, 8, 12, 16, 20, 24, 28],
    [2, 5, 9, 13, 17, 21, 25, 29],
    [1, 6, 11, 16, 21, 26],
    [3, 7, 14, 21, 28],
    [0, 5, 10, 15, 20, 25],
  ]
  for (const [i, user] of colaboradoras.entries()) {
    for (const d of patterns[i] ?? []) {
      loginData.push({ userId: user.id, createdAt: daysAgo(d) })
    }
  }
  // Gerente
  for (let d = 0; d < 30; d += 3) {
    loginData.push({ userId: gerente.id, createdAt: daysAgo(d) })
  }
  for (const entry of loginData) {
    await prisma.loginLog.create({ data: entry })
  }
  console.log(`✅ ${loginData.length} logs de acesso criados`)

  // ── POPs ──────────────────────────────────────────────────────────────────
  await prisma.pOPDocument.create({
    data: {
      title: 'Abertura de Loja',
      slug: 'abertura-de-loja',
      category: 'Operacional',
      order: 0,
      status: 'PUBLISHED',
      createdById: admin.id,
      content: `# Procedimento de Abertura de Loja\n\n## Objetivo\nGarantir que a loja seja aberta de forma padronizada, segura e organizada para o atendimento das clientes.\n\n## Responsável\nSupervisora ou Gerente de Loja\n\n## Passo a Passo\n\n### 1. Chegada\n- Chegar **15 minutos** antes do horário de abertura\n- Verificar se há mensagens ou pendências da loja anterior\n\n### 2. Segurança\n- Desativar o sistema de alarme conforme protocolo\n- Verificar câmeras e registrar qualquer ocorrência\n- Inspecionar visualmente toda a loja antes de abrir\n\n### 3. Limpeza e Organização\n- Confirmar que a limpeza noturna foi realizada\n- Organizar vitrine conforme planograma do mês\n- Verificar etiquetagem e precificação dos produtos\n\n### 4. Operação\n- Ligar computadores e aguardar a abertura dos sistemas\n- Conferir o troco inicial do caixa\n- Verificar estoque de embalagens e sacolas\n\n### 5. Abertura ao Público\n- Destrancar a entrada exatamente no horário de abertura\n- Garantir que ao menos 2 colaboradoras estão presentes\n\n## Observações\n> Em caso de qualquer irregularidade, acionar imediatamente a gestão regional.`,
    },
  })

  await prisma.pOPDocument.create({
    data: {
      title: 'Fechamento de Loja',
      slug: 'fechamento-de-loja',
      category: 'Operacional',
      order: 1,
      status: 'PUBLISHED',
      createdById: admin.id,
      content: `# Procedimento de Fechamento de Loja\n\n## Objetivo\nGarantir que a loja seja fechada de forma segura, com todos os controles registrados.\n\n## Responsável\nSupervisora ou Gerente de Loja\n\n## Passo a Passo\n\n### 1. 30 minutos antes do fechamento\n- Comunicar às clientes que a loja fechará em 30 minutos\n- Não iniciar novos atendimentos complexos\n\n### 2. Fechamento do Caixa\n- Realizar o fechamento do PDV\n- Contar o caixa e comparar com o sistema\n- Registrar qualquer diferença e informar a gestão\n- Preparar malote para depósito (conforme protocolo de segurança)\n\n### 3. Organização\n- Organizar vitrines e displays para o dia seguinte\n- Recolher e guardar produtos de exposição de valor\n- Passar aspirador e garantir limpeza básica\n\n### 4. Segurança\n- Verificar se todos os clientes saíram da loja\n- Checar todas as janelas e portas traseiras\n- Ativar o sistema de alarme\n- Registrar o fechamento no sistema\n\n### 5. Saída\n- A última colaboradora deve sair sempre acompanhada\n- Confirmar o travamento da porta principal\n- Enviar confirmação de fechamento para a supervisão regional`,
    },
  })

  await prisma.pOPDocument.create({
    data: {
      title: 'Protocolo de Atendimento ao Cliente',
      slug: 'protocolo-atendimento-cliente',
      category: 'Atendimento',
      order: 2,
      status: 'PUBLISHED',
      createdById: admin.id,
      content: `# Protocolo de Atendimento ao Cliente MIL\n\n## Filosofia de Atendimento\nNa MIL, cada cliente é única. Nosso compromisso é proporcionar uma experiência memorável que vai além da compra.\n\n## Os 5 Momentos do Atendimento\n\n### 1. Acolhida\n- Cumprimento caloroso com contato visual e sorriso genuíno\n- Oferecer ajuda sem ser invasiva: "Posso te ajudar a encontrar algo especial hoje?"\n- Respeitar o espaço da cliente que prefere olhar sozinha\n\n### 2. Sondagem\n- Fazer perguntas abertas: "O que você está procurando?", "Para qual ocasião?"\n- Ouvir com atenção — não interromper\n- Identificar o estilo, orçamento e necessidade real da cliente\n\n### 3. Apresentação de Produtos\n- Mostrar no máximo 3 opções bem selecionadas\n- Destacar benefícios relevantes para a necessidade identificada\n- Permitir que a cliente experimente e interaja com os produtos\n\n### 4. Fechamento\n- Resumir os benefícios do produto escolhido\n- Facilitar a decisão: "Esta peça combina perfeitamente com o que você descreveu"\n- Oferecer complementos de forma natural\n\n### 5. Pós-venda\n- Agradecer com sinceridade e personalização\n- Convidar para seguir nas redes sociais e retornar\n- Registrar o contato quando autorizado pela cliente\n\n## Tratamento de Trocas e Reclamações\n1. Acolher sem questionar\n2. Pedir desculpas pelo inconveniente\n3. Buscar a melhor solução dentro das políticas\n4. Registrar a ocorrência no sistema`,
    },
  })
  console.log('✅ 3 POPs publicados')

  // ── PESQUISA DE CLIMA ──────────────────────────────────────────────────────
  const climateResearch = await prisma.climateResearch.create({
    data: {
      title: 'Pesquisa de Clima — Junho 2026',
      description: 'Sua opinião é muito importante. Esta pesquisa é anônima e nos ajuda a melhorar o ambiente de trabalho para toda a equipe.',
      isActive: true,
      isAnonymous: true,
      startDate: daysAgo(14),
      endDate: new Date(Date.now() + 16 * 86_400_000),
    },
  })

  const climateQs = await Promise.all([
    prisma.climateQuestion.create({ data: { researchId: climateResearch.id, text: 'Como você avalia o ambiente de trabalho na sua loja?', type: 'SCALE', scaleMin: 1, scaleMax: 5, order: 0 } }),
    prisma.climateQuestion.create({ data: { researchId: climateResearch.id, text: 'Você se sente reconhecida e valorizada pelo seu trabalho?', type: 'SCALE', scaleMin: 1, scaleMax: 5, order: 1 } }),
    prisma.climateQuestion.create({ data: { researchId: climateResearch.id, text: 'Como você avalia a comunicação com a sua liderança direta?', type: 'SCALE', scaleMin: 1, scaleMax: 5, order: 2 } }),
    prisma.climateQuestion.create({ data: { researchId: climateResearch.id, text: 'Você indicaria a MIL como um bom lugar para trabalhar para uma amiga?', type: 'SCALE', scaleMin: 0, scaleMax: 10, order: 3 } }),
    prisma.climateQuestion.create({ data: { researchId: climateResearch.id, text: 'O que poderia melhorar no seu dia a dia de trabalho? (opcional)', type: 'TEXT', required: false, order: 4 } }),
  ])

  // Respostas: Loja Centro (3 resps) e Loja Shopping (2 resps) — Loja Norte SEM resposta (aparece em vermelho)
  type ClimateAnswerEntry = { questionId: string; value: string }
  const createClimateResponse = async (
    userId: string,
    storeId: string,
    answers: ClimateAnswerEntry[]
  ) => {
    const response = await prisma.climateResponse.create({
      data: { researchId: climateResearch.id, userId, storeId, submittedAt: daysAgo(Math.floor(Math.random() * 7)) },
    })
    await prisma.climateAnswer.createMany({
      data: answers.map((a) => ({ responseId: response.id, questionId: a.questionId, value: a.value })),
    })
  }

  // Loja Centro — 3 respostas
  await createClimateResponse(colaboradoras[0].id, storeCentro.id, [
    { questionId: climateQs[0].id, value: '4' }, { questionId: climateQs[1].id, value: '5' },
    { questionId: climateQs[2].id, value: '4' }, { questionId: climateQs[3].id, value: '9' },
    { questionId: climateQs[4].id, value: 'Mais treinamentos práticos seriam ótimos!' },
  ])
  await createClimateResponse(colaboradoras[1].id, storeCentro.id, [
    { questionId: climateQs[0].id, value: '5' }, { questionId: climateQs[1].id, value: '4' },
    { questionId: climateQs[2].id, value: '5' }, { questionId: climateQs[3].id, value: '10' },
    { questionId: climateQs[4].id, value: '' },
  ])
  await createClimateResponse(supervisora.id, storeCentro.id, [
    { questionId: climateQs[0].id, value: '4' }, { questionId: climateQs[1].id, value: '4' },
    { questionId: climateQs[2].id, value: '5' }, { questionId: climateQs[3].id, value: '9' },
    { questionId: climateQs[4].id, value: 'Gostaríamos de mais reuniões de alinhamento com a gestão.' },
  ])

  // Loja Shopping — 2 respostas
  await createClimateResponse(colaboradoras[2].id, storeShopping.id, [
    { questionId: climateQs[0].id, value: '3' }, { questionId: climateQs[1].id, value: '3' },
    { questionId: climateQs[2].id, value: '4' }, { questionId: climateQs[3].id, value: '7' },
    { questionId: climateQs[4].id, value: 'O espaço da copa poderia ser maior.' },
  ])
  await createClimateResponse(colaboradoras[3].id, storeShopping.id, [
    { questionId: climateQs[0].id, value: '4' }, { questionId: climateQs[1].id, value: '4' },
    { questionId: climateQs[2].id, value: '3' }, { questionId: climateQs[3].id, value: '8' },
    { questionId: climateQs[4].id, value: '' },
  ])
  // Loja Norte — SEM respostas (aparece em vermelho no painel)
  console.log('✅ Pesquisa de Clima criada com respostas (Loja Norte sem resposta → vermelho no painel)')

  // ── CHECKLISTS ─────────────────────────────────────────────────────────────
  const cl1 = await prisma.checklistTemplate.create({
    data: {
      title: 'Padronização de Loja',
      description: 'Avaliação mensal de conformidade com os padrões visuais e operacionais da marca MIL.',
      status: 'ACTIVE',
      items: {
        create: [
          { text: 'Vitrine organizada conforme manual de visual merchandising vigente', category: 'Visual', order: 0 },
          { text: 'Iluminação de vitrine e loja funcionando 100% — sem lâmpadas queimadas', category: 'Visual', order: 1 },
          { text: 'Produtos etiquetados, organizados por categoria e com precificação correta', category: 'Organização', order: 2 },
          { text: 'Área de caixa limpa, organizada e sem objetos pessoais à vista', category: 'Organização', order: 3 },
          { text: 'Piso, superfícies e espelhos limpos e sem marcas visíveis', category: 'Higiene', order: 4 },
          { text: 'Banheiro limpo, abastecido com papel e sabonete', category: 'Higiene', order: 5 },
          { text: 'Colaboradoras com uniforme completo, limpo e em bom estado', category: 'Uniforme', order: 6 },
          { text: 'Crachás de identificação visíveis em todas as colaboradoras em atendimento', category: 'Uniforme', order: 7 },
        ],
      },
    },
  })

  const cl1Items = await prisma.checklistItem.findMany({ where: { templateId: cl1.id }, orderBy: { order: 'asc' } })

  // Resposta Loja Centro — score 87.5% (7 de 8 itens ok)
  const cl1RespCentro = await prisma.checklistResponse.create({
    data: {
      templateId: cl1.id, responderId: supervisora.id, storeName: 'Loja Centro',
      storeCode: 'CENTRO', storeId: storeCentro.id, score: 87.5,
      submittedAt: daysAgo(5),
      notes: 'Lâmpada da vitrine direita precisa de substituição.',
    },
  })
  await prisma.checklistAnswerItem.createMany({
    data: cl1Items.map((item, i) => ({
      responseId: cl1RespCentro.id, itemId: item.id,
      ok: i !== 1,
      note: i === 1 ? 'Lâmpada queimada — solicitação de manutenção enviada' : null,
    })),
  })

  // Resposta Loja Shopping — score 75% (6 de 8 itens ok)
  const cl1RespShopping = await prisma.checklistResponse.create({
    data: {
      templateId: cl1.id, responderId: gerente.id, storeName: 'Loja Shopping',
      storeCode: 'SHOPPING', storeId: storeShopping.id, score: 75.0,
      submittedAt: daysAgo(4),
    },
  })
  await prisma.checklistAnswerItem.createMany({
    data: cl1Items.map((item, i) => ({
      responseId: cl1RespShopping.id, itemId: item.id,
      ok: i !== 4 && i !== 5,
      note: i === 4 ? 'Piso com marcas de sapato — limpeza agendada' : i === 5 ? 'Banheiro sem papel toalha' : null,
    })),
  })

  // Resposta Loja Norte — score 100%
  const cl1RespNorte = await prisma.checklistResponse.create({
    data: {
      templateId: cl1.id, responderId: colaboradoras[5].id, storeName: 'Loja Norte',
      storeCode: 'NORTE', storeId: storeNorte.id, score: 100.0,
      submittedAt: daysAgo(3),
    },
  })
  await prisma.checklistAnswerItem.createMany({
    data: cl1Items.map((item) => ({ responseId: cl1RespNorte.id, itemId: item.id, ok: true, note: null })),
  })

  // Checklist 2: Checklist de Abertura
  const cl2 = await prisma.checklistTemplate.create({
    data: {
      title: 'Checklist de Abertura',
      description: 'Verificação diária dos procedimentos de abertura da loja.',
      status: 'ACTIVE',
      items: {
        create: [
          { text: 'Alarme desativado e câmeras verificadas', category: 'Segurança', order: 0 },
          { text: 'Troco inicial conferido e registrado', category: 'Caixa', order: 1 },
          { text: 'Sistemas de PDV ligados e funcionando', category: 'Sistemas', order: 2 },
          { text: 'Estoque de embalagens verificado', category: 'Operacional', order: 3 },
          { text: 'Vitrine ajustada conforme orientação do dia', category: 'Visual', order: 4 },
          { text: 'WhatsApp comercial verificado e pendências respondidas', category: 'Atendimento', order: 5 },
        ],
      },
    },
  })

  const cl2Items = await prisma.checklistItem.findMany({ where: { templateId: cl2.id }, orderBy: { order: 'asc' } })

  // Loja Centro — 100%
  const cl2RespCentro = await prisma.checklistResponse.create({
    data: { templateId: cl2.id, responderId: supervisora.id, storeName: 'Loja Centro', storeCode: 'CENTRO', storeId: storeCentro.id, score: 100.0, submittedAt: daysAgo(1) },
  })
  await prisma.checklistAnswerItem.createMany({
    data: cl2Items.map((item) => ({ responseId: cl2RespCentro.id, itemId: item.id, ok: true, note: null })),
  })

  // Loja Shopping — 83.3% (5 de 6)
  const cl2RespShopping = await prisma.checklistResponse.create({
    data: { templateId: cl2.id, responderId: gerente.id, storeName: 'Loja Shopping', storeCode: 'SHOPPING', storeId: storeShopping.id, score: 83.3, submittedAt: daysAgo(1) },
  })
  await prisma.checklistAnswerItem.createMany({
    data: cl2Items.map((item, i) => ({ responseId: cl2RespShopping.id, itemId: item.id, ok: i !== 4, note: i === 4 ? 'Aguardando orientação do VM' : null })),
  })
  console.log('✅ 2 Checklists criados com respostas variadas')

  // ── NPS LÍDERES ───────────────────────────────────────────────────────────
  const npsCampaign = await prisma.nPSCampaign.create({
    data: {
      title: 'NPS Líderes — Junho 2026',
      description: 'Avalie sua experiência com as lideranças e a empresa. Sua resposta é anônima e muito importante para nós.',
      isActive: true,
      deadlineDate: new Date(Date.now() + 9 * 86_400_000),
    },
  })

  const npsQs = await Promise.all([
    prisma.nPSQuestion.create({ data: { campaignId: npsCampaign.id, text: 'De 0 a 10, o quanto você recomendaria trabalhar na MIL para uma amiga?', type: 'SCALE', order: 0 } }),
    prisma.nPSQuestion.create({ data: { campaignId: npsCampaign.id, text: 'O que mais te satisfaz no seu trabalho aqui?', type: 'TEXT', order: 1 } }),
    prisma.nPSQuestion.create({ data: { campaignId: npsCampaign.id, text: 'O que poderia melhorar na gestão da sua loja?', type: 'TEXT', order: 2 } }),
  ])

  const npsLeader1 = await prisma.nPSLeader.create({ data: { campaignId: npsCampaign.id, name: 'Mariana Torres' } })
  const npsLeader2 = await prisma.nPSLeader.create({ data: { campaignId: npsCampaign.id, name: 'Patrícia Mendes' } })

  const npsScores = [9, 8, 10, 7, 9]
  const npsComments = [
    ['O ambiente colaborativo e a equipe incrível', 'Comunicação mais frequente sobre metas', null],
    ['As oportunidades de aprendizado na plataforma', 'Reuniões de feedback mais regulares', npsLeader1.id],
    ['O reconhecimento pelo trabalho bem feito', 'Nada por enquanto, está ótimo!', npsLeader1.id],
    ['A flexibilidade e os benefícios', 'Mais treinamentos presenciais', npsLeader2.id],
    ['O propósito da empresa e o produto', 'Processo de pedido de férias mais digital', npsLeader2.id],
  ]
  const npsRespondents = [colaboradoras[0], colaboradoras[1], colaboradoras[2], colaboradoras[5], colaboradoras[6]]

  for (let i = 0; i < npsRespondents.length; i++) {
    const resp = await prisma.nPSResponse.create({
      data: {
        campaignId: npsCampaign.id,
        responderId: npsRespondents[i].id,
        leaderId: npsComments[i][2] as string | null,
        score: npsScores[i],
        comment: npsComments[i][0] as string,
        submittedAt: daysAgo(i + 1),
      },
    })
    await prisma.nPSAnswer.createMany({
      data: [
        { responseId: resp.id, questionId: npsQs[0].id, value: String(npsScores[i]) },
        { responseId: resp.id, questionId: npsQs[1].id, value: npsComments[i][0] as string },
        { responseId: resp.id, questionId: npsQs[2].id, value: npsComments[i][1] as string },
      ],
    })
  }
  console.log('✅ Campanha NPS criada com 5 respostas')

  // ── PLATFORM CONFIG ────────────────────────────────────────────────────────
  await prisma.platformConfig.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      platformName: 'Universo Mil',
      primaryColor: '#EC55B5',
      instagramUrl: 'https://www.instagram.com/milbijus/',
      facebookUrl: 'https://www.facebook.com/MilBijus/?locale=pt_BR',
      websiteUrl: 'https://www.milbijus.com.br',
    },
    update: {
      platformName: 'Universo Mil',
      primaryColor: '#EC55B5',
      instagramUrl: 'https://www.instagram.com/milbijus/',
      facebookUrl: 'https://www.facebook.com/MilBijus/?locale=pt_BR',
      websiteUrl: 'https://www.milbijus.com.br',
    },
  })

  console.log('\n🎉 Seed de demonstração concluído!\n')
  console.log('┌─────────────────────────────────────────────────────────┐')
  console.log('│  CONTAS DE DEMONSTRAÇÃO                                 │')
  console.log('├──────────────────────────────┬──────────────────────────┤')
  console.log('│  admin@demo.com              │  Demo@2024  (ADMIN)      │')
  console.log('│  supervisora@demo.com        │  Demo@2024  (SUPERVISAO) │')
  console.log('│  colaboradora@demo.com       │  Demo@2024  (COLABORADOR)│')
  console.log('└──────────────────────────────┴──────────────────────────┘')
  console.log('\n📋 ROTEIRO DO VÍDEO — dados preparados:')
  console.log('  ✅ 3 lojas (Centro, Shopping, Norte)')
  console.log('  ✅ 12 usuários (2 demo + 8 colaboradoras + gerente)')
  console.log('  ✅ 2 cursos publicados × 3 módulos × 3 aulas')
  console.log('  ✅ 2 avaliações com 5 perguntas cada')
  console.log('  ✅ 3 POPs publicados')
  console.log('  ✅ Pesquisa de clima ativa (Loja Norte sem resposta → card vermelho)')
  console.log('  ✅ 2 checklists com scores variados por loja')
  console.log('  ✅ Campanha NPS ativa com 5 respostas')
  console.log('  ✅ Supervisora com Módulo 1 concluído (card de avaliação desbloqueado)')
  console.log('  ✅ Certificados emitidos para supervisora')
  console.log('  ✅ 30 dias de logs de login para o gráfico do dashboard')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
