import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const YT = (id: string, secs: number) => ({
  youtubeUrl: `https://www.youtube.com/watch?v=${id}`,
  durationSecs: secs,
})

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpar em ordem correta de dependência (novos modelos incluídos)
  await prisma.certificate.deleteMany()
  await prisma.nPSAnswer.deleteMany()
  await prisma.nPSResponse.deleteMany()
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

  // ── LOJAS ────────────────────────────────────────────────────────
  const storeCentro = await prisma.store.create({
    data: { name: 'Loja Centro', code: 'CENTRO', isActive: true },
  })
  const storeShopping = await prisma.store.create({
    data: { name: 'Loja Shopping', code: 'SHOPPING', isActive: true },
  })
  const storeNorte = await prisma.store.create({
    data: { name: 'Loja Norte', code: 'NORTE', isActive: true },
  })
  console.log('✅ 3 Lojas criadas')

  // ── USUÁRIOS ─────────────────────────────────────────────────────
  const defaultPassword = await bcrypt.hash('teste123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@demo.com.br',
      passwordHash: defaultPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // Usuário por loja (acesso demo por unidade)
  for (const store of [storeCentro, storeShopping, storeNorte]) {
    const email = store.name.toLowerCase().replace(/\s+/g, '') + '@demo.com.br'
    await prisma.user.create({
      data: { name: store.name, email, passwordHash: defaultPassword, role: 'COLABORADOR', storeId: store.id },
    })
    console.log('✅ Usuário loja criado:', email)
  }

  const studentPassword = defaultPassword
  const student = await prisma.user.create({
    data: {
      name: 'Colaboradora Teste',
      email: 'teste@plataforma.com',
      passwordHash: studentPassword,
      cpf: '12345678901',
      role: 'COLABORADOR',
      storeId: storeCentro.id,
    },
  })

  const student2 = await prisma.user.create({
    data: {
      name: 'Maria Silva',
      email: 'maria.silva@plataforma.com',
      passwordHash: studentPassword,
      role: 'COLABORADOR',
      storeId: storeShopping.id,
    },
  })

  const student3 = await prisma.user.create({
    data: {
      name: 'Ana Costa',
      email: 'ana.costa@plataforma.com',
      passwordHash: studentPassword,
      role: 'COLABORADOR',
      storeId: storeCentro.id,
    },
  })

  const supervisora = await prisma.user.create({
    data: {
      name: 'Supervisora Centro',
      email: 'supervisao@plataforma.com',
      passwordHash: studentPassword,
      role: 'SUPERVISAO',
      storeId: storeCentro.id,
    },
  })
  console.log('✅ Usuários criados')

  // ── CURSO 1: MÓDULO DE BOAS-VINDAS ───────────────────────────────
  const course1 = await prisma.course.create({
    data: {
      name: 'Módulo de Boas-Vindas',
      slug: 'modulo-boas-vindas',
      description: 'Bem-vinda à equipe! Este módulo vai te orientar sobre tudo que você precisa saber para começar com o pé direito.',
      status: 'PUBLISHED',
      order: 0,
    },
  })

  const c1m1 = await prisma.module.create({
    data: { courseId: course1.id, title: 'Módulo 1 — Introdução', slug: 'modulo-1-introducao', order: 0 },
  })
  await prisma.lesson.createMany({
    data: [
      { moduleId: c1m1.id, title: '1.1 — Bem-vinda à equipe', slug: '11-bem-vinda-equipe', ...YT('dQw4w9WgXcQ', 212), type: 'VIDEO', order: 0, description: 'Uma calorosa boas-vindas de toda a equipe.' },
      { moduleId: c1m1.id, title: '1.2 — Nossa história', slug: '12-nossa-historia', ...YT('9bZkp7q19f0', 252), type: 'VIDEO', order: 1, description: 'Como tudo começou.' },
      { moduleId: c1m1.id, title: '1.3 — Missão, Visão e Valores', slug: '13-missao-visao-valores', ...YT('OPf0YbXqDm0', 269), type: 'VIDEO', order: 2, description: 'Nossos pilares culturais.' },
    ],
  })

  const c1m2 = await prisma.module.create({
    data: { courseId: course1.id, title: 'Módulo 2 — Código de Cultura', slug: 'modulo-2-codigo-cultura', order: 1 },
  })
  await prisma.lesson.createMany({
    data: [
      { moduleId: c1m2.id, title: '2.1 — Nossos valores na prática', slug: '21-nossos-valores', ...YT('JGwWNGJdvx8', 234), type: 'VIDEO', order: 0, description: 'Como nossos valores se manifestam no trabalho.' },
      { moduleId: c1m2.id, title: '2.2 — Como trabalhamos', slug: '22-como-trabalhamos', ...YT('kJQP7kiw5Fk', 282), type: 'VIDEO', order: 1, description: 'Nossa metodologia de trabalho.' },
      { moduleId: c1m2.id, title: '2.3 — Políticas internas', slug: '23-politicas-internas', ...YT('YQHsXMglC9A', 295), type: 'VIDEO', order: 2, description: 'RH, benefícios e jornada.' },
    ],
  })
  console.log('✅ Curso 1 criado com 6 aulas')

  // ── CURSO 2: DESENVOLVIMENTO PESSOAL ────────────────────────────
  const course2 = await prisma.course.create({
    data: {
      name: 'Desenvolvimento Pessoal e Produtividade',
      slug: 'desenvolvimento-pessoal',
      description: 'Técnicas e estratégias para maximizar sua produtividade e desenvolver hábitos de alta performance.',
      status: 'PUBLISHED',
      order: 1,
    },
  })

  const c2m1 = await prisma.module.create({
    data: { courseId: course2.id, title: 'Módulo 1 — Mentalidade e Foco', slug: 'mentalidade-e-foco', order: 0 },
  })
  await prisma.lesson.createMany({
    data: [
      { moduleId: c2m1.id, title: '1.1 — Como definir seus objetivos', slug: '11-como-definir-objetivos', ...YT('CevxZvSJLk8', 229), type: 'VIDEO', order: 0 },
      { moduleId: c2m1.id, title: '1.2 — A técnica Pomodoro na prática', slug: '12-tecnica-pomodoro', ...YT('nfWlot6h_JM', 220), type: 'VIDEO', order: 1 },
      { moduleId: c2m1.id, title: '1.3 — Gestão do tempo essencial', slug: '13-gestao-do-tempo', ...YT('hT_nvWreIhg', 251), type: 'VIDEO', order: 2 },
      { moduleId: c2m1.id, title: '1.4 — Lidando com distrações digitais', slug: '14-distracoes-digitais', ...YT('y6Sxv-sUYtM', 187), type: 'VIDEO', order: 3 },
    ],
  })

  const c2m2 = await prisma.module.create({
    data: { courseId: course2.id, title: 'Módulo 2 — Hábitos e Rotina', slug: 'habitos-e-rotina', order: 1 },
  })
  await prisma.lesson.createMany({
    data: [
      { moduleId: c2m2.id, title: '2.1 — A ciência dos hábitos', slug: '21-ciencia-dos-habitos', ...YT('pRpeEdMmmQ0', 228), type: 'VIDEO', order: 0 },
      { moduleId: c2m2.id, title: '2.2 — Construindo uma rotina matinal', slug: '22-rotina-matinal', ...YT('WA4iX5D9Z64', 294), type: 'VIDEO', order: 1 },
      { moduleId: c2m2.id, title: '2.3 — Revisão semanal e planejamento', slug: '23-revisao-semanal', ...YT('60ItHLz5WEA', 228), type: 'VIDEO', order: 2 },
      { moduleId: c2m2.id, title: '2.4 — Celebrando pequenas vitórias', slug: '24-pequenas-vitorias', ...YT('L_jWHffIx5E', 356), type: 'VIDEO', order: 3 },
    ],
  })
  console.log('✅ Curso 2 criado com 8 aulas')

  // ── CURSO 3: LIDERANÇA ────────────────────────────────────────────
  const course3 = await prisma.course.create({
    data: {
      name: 'Liderança e Comunicação',
      slug: 'lideranca-e-comunicacao',
      description: 'Desenvolva habilidades de liderança situacional, feedback eficaz e comunicação assertiva.',
      status: 'PUBLISHED',
      order: 2,
    },
  })

  const c3m1 = await prisma.module.create({
    data: { courseId: course3.id, title: 'Módulo 1 — Liderança Situacional', slug: 'lideranca-situacional', order: 0 },
  })
  const c3m1Lessons = await prisma.lesson.findMany({ where: { moduleId: c3m1.id } })
  await prisma.lesson.createMany({
    data: [
      { moduleId: c3m1.id, title: '1.1 — O que é liderança situacional', slug: '11-lideranca-situacional', ...YT('dQw4w9WgXcQ', 195), type: 'VIDEO', order: 0 },
      { moduleId: c3m1.id, title: '1.2 — Os 4 estilos de liderança', slug: '12-estilos-lideranca', ...YT('JGwWNGJdvx8', 240), type: 'VIDEO', order: 1 },
      { moduleId: c3m1.id, title: '1.3 — Feedback que transforma', slug: '13-feedback-eficaz', ...YT('9bZkp7q19f0', 265), type: 'VIDEO', order: 2 },
    ],
  })

  const c3m2 = await prisma.module.create({
    data: { courseId: course3.id, title: 'Módulo 2 — Comunicação Assertiva', slug: 'comunicacao-assertiva', order: 1 },
  })
  await prisma.lesson.createMany({
    data: [
      { moduleId: c3m2.id, title: '2.1 — Fundamentos da comunicação eficaz', slug: '21-fundamentos-comunicacao', ...YT('OPf0YbXqDm0', 248), type: 'VIDEO', order: 0 },
      { moduleId: c3m2.id, title: '2.2 — Escuta ativa', slug: '22-escuta-ativa', ...YT('CevxZvSJLk8', 218), type: 'VIDEO', order: 1 },
      { moduleId: c3m2.id, title: '2.3 — Comunicação Não-Violenta', slug: '23-comunicacao-nao-violenta', ...YT('YQHsXMglC9A', 285), type: 'VIDEO', order: 2 },
    ],
  })
  console.log('✅ Curso 3 criado com 6 aulas')

  // ── AVALIAÇÕES DE EXEMPLO ─────────────────────────────────────────
  // Buscar aulas para vincular avaliações
  const allLessons = await prisma.lesson.findMany({ take: 3, orderBy: { order: 'asc' } })
  if (allLessons.length >= 3) {
    const av1 = await prisma.assessment.create({
      data: {
        lessonId: allLessons[0].id,
        title: 'Onboarding Inicial',
        type: 'COMMON',
        status: 'ACTIVE',
        passingScore: 70,
        questions: {
          create: [
            {
              text: 'Qual é o principal objetivo do módulo de boas-vindas?',
              type: 'SINGLE',
              order: 0,
              options: {
                create: [
                  { text: 'Apresentar a história e cultura da empresa', isCorrect: true, order: 0 },
                  { text: 'Ensinar técnicas de vendas', isCorrect: false, order: 1 },
                  { text: 'Configurar equipamentos', isCorrect: false, order: 2 },
                  { text: 'Treinar atendimento ao cliente', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'O que representa a missão da empresa?',
              type: 'SINGLE',
              order: 1,
              options: {
                create: [
                  { text: 'O propósito maior que guia todas as decisões', isCorrect: true, order: 0 },
                  { text: 'A meta de vendas anual', isCorrect: false, order: 1 },
                  { text: 'O manual de uniformes', isCorrect: false, order: 2 },
                  { text: 'O horário de funcionamento', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'Como os valores da empresa se manifestam no dia a dia?',
              type: 'SINGLE',
              order: 2,
              options: {
                create: [
                  { text: 'Nas decisões, comportamentos e relacionamentos', isCorrect: true, order: 0 },
                  { text: 'Apenas em documentos oficiais', isCorrect: false, order: 1 },
                  { text: 'Somente nas reuniões mensais', isCorrect: false, order: 2 },
                  { text: 'No layout da loja', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'Qual canal usar para dúvidas sobre benefícios?',
              type: 'SINGLE',
              order: 3,
              options: {
                create: [
                  { text: 'RH da empresa', isCorrect: true, order: 0 },
                  { text: 'Redes sociais da marca', isCorrect: false, order: 1 },
                  { text: 'Clientes da loja', isCorrect: false, order: 2 },
                  { text: 'Fornecedores', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'Qual é a importância do código de cultura?',
              type: 'SINGLE',
              order: 4,
              options: {
                create: [
                  { text: 'Define como nos comportamos e tomamos decisões juntos', isCorrect: true, order: 0 },
                  { text: 'É apenas um documento formal sem aplicação prática', isCorrect: false, order: 1 },
                  { text: 'Serve somente para novos colaboradores', isCorrect: false, order: 2 },
                  { text: 'Define as metas de vendas', isCorrect: false, order: 3 },
                ],
              },
            },
          ],
        },
      },
    })

    const av2 = await prisma.assessment.create({
      data: {
        lessonId: allLessons[1].id,
        title: 'Procedimentos de Atendimento',
        type: 'COMMON',
        status: 'ACTIVE',
        passingScore: 80,
        questions: {
          create: [
            {
              text: 'Qual a primeira coisa a fazer ao recepcionar uma cliente?',
              type: 'SINGLE',
              order: 0,
              options: {
                create: [
                  { text: 'Cumprimentar com sorriso e oferecer ajuda', isCorrect: true, order: 0 },
                  { text: 'Continuar o que estava fazendo', isCorrect: false, order: 1 },
                  { text: 'Perguntar o CPF da cliente', isCorrect: false, order: 2 },
                  { text: 'Ligar para a supervisão', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'Como lidar com uma cliente insatisfeita?',
              type: 'SINGLE',
              order: 1,
              options: {
                create: [
                  { text: 'Ouvir com atenção, pedir desculpas e buscar solução', isCorrect: true, order: 0 },
                  { text: 'Ignorar e chamar outra colaboradora', isCorrect: false, order: 1 },
                  { text: 'Discutir o motivo da reclamação', isCorrect: false, order: 2 },
                  { text: 'Dizer que a política da loja não permite troca', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'Qual o prazo máximo para responder mensagens no WhatsApp comercial?',
              type: 'SINGLE',
              order: 2,
              options: {
                create: [
                  { text: 'Até 2 horas durante horário de funcionamento', isCorrect: true, order: 0 },
                  { text: 'Até 24 horas', isCorrect: false, order: 1 },
                  { text: 'Não há prazo definido', isCorrect: false, order: 2 },
                  { text: 'Apenas no dia seguinte', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'O que fazer quando um produto está em falta no estoque?',
              type: 'SINGLE',
              order: 3,
              options: {
                create: [
                  { text: 'Oferecer alternativa similar e verificar prazo de reposição', isCorrect: true, order: 0 },
                  { text: 'Dizer simplesmente que não tem', isCorrect: false, order: 1 },
                  { text: 'Pedir para a cliente voltar amanhã sem mais informações', isCorrect: false, order: 2 },
                  { text: 'Transferir a chamada para a gerência', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'Como fechar uma venda de forma eficaz?',
              type: 'SINGLE',
              order: 4,
              options: {
                create: [
                  { text: 'Resumir os benefícios e confirmar a decisão da cliente', isCorrect: true, order: 0 },
                  { text: 'Pressionar para uma decisão rápida', isCorrect: false, order: 1 },
                  { text: 'Oferecer desconto imediatamente', isCorrect: false, order: 2 },
                  { text: 'Pedir aprovação da supervisora antes', isCorrect: false, order: 3 },
                ],
              },
            },
          ],
        },
      },
    })

    const av3 = await prisma.assessment.create({
      data: {
        lessonId: allLessons[2].id,
        title: 'Segurança do Trabalho',
        type: 'CERT',
        status: 'ACTIVE',
        passingScore: 100,
        questions: {
          create: [
            {
              text: 'O que fazer em caso de incêndio na loja?',
              type: 'SINGLE',
              order: 0,
              options: {
                create: [
                  { text: 'Acionar alarme, evacuar clientes e ligar para o SAMU/Bombeiros', isCorrect: true, order: 0 },
                  { text: 'Tentar apagar o fogo sozinha', isCorrect: false, order: 1 },
                  { text: 'Continuar atendendo', isCorrect: false, order: 2 },
                  { text: 'Chamar apenas a supervisora', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'Como prevenir acidentes com quedas no ambiente de trabalho?',
              type: 'SINGLE',
              order: 1,
              options: {
                create: [
                  { text: 'Manter pisos secos, sinalizados e caminhos desobstruídos', isCorrect: true, order: 0 },
                  { text: 'Usar apenas calçados altos', isCorrect: false, order: 1 },
                  { text: 'Correr quando necessário', isCorrect: false, order: 2 },
                  { text: 'Esperar manutenção resolver os problemas', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'Onde fica o kit de primeiros socorros da loja?',
              type: 'SINGLE',
              order: 2,
              options: {
                create: [
                  { text: 'No local indicado no mapa de evacuação, acessível a todas', isCorrect: true, order: 0 },
                  { text: 'Na bolsa da gerente', isCorrect: false, order: 1 },
                  { text: 'No almoxarifado trancado', isCorrect: false, order: 2 },
                  { text: 'Não existe kit na loja', isCorrect: false, order: 3 },
                ],
              },
            },
            {
              text: 'O que é obrigação de todos em relação à segurança no trabalho?',
              type: 'SINGLE',
              order: 3,
              options: {
                create: [
                  { text: 'Seguir normas, reportar riscos e participar de treinamentos', isCorrect: true, order: 0 },
                  { text: 'Apenas seguir as instruções quando convier', isCorrect: false, order: 1 },
                  { text: 'Responsabilidade exclusiva da gestão', isCorrect: false, order: 2 },
                  { text: 'Não é necessário se preocupar em lojas de varejo', isCorrect: false, order: 3 },
                ],
              },
            },
          ],
        },
      },
    })
    console.log('✅ 3 Avaliações criadas:', av1.title, '|', av2.title, '|', av3.title)
  }

  // ── MATRÍCULAS ────────────────────────────────────────────────────
  await prisma.userCourse.createMany({
    data: [
      { userId: student.id, courseId: course1.id },
      { userId: student.id, courseId: course2.id },
      { userId: student.id, courseId: course3.id },
      { userId: student2.id, courseId: course1.id },
      { userId: student2.id, courseId: course2.id },
      { userId: student3.id, courseId: course1.id },
      { userId: student3.id, courseId: course3.id },
      { userId: supervisora.id, courseId: course1.id },
    ],
  })

  // ── PROGRESSO SIMULADO ────────────────────────────────────────────
  const c1m1Lessons = await prisma.lesson.findMany({ where: { moduleId: c1m1.id } })
  await prisma.lessonProgress.createMany({
    data: c1m1Lessons.map((l) => ({
      userId: student.id,
      lessonId: l.id,
      watchedSecs: l.durationSecs ?? 0,
      completed: true,
      completedAt: new Date(),
    })),
  })

  const c2m1Lessons = await prisma.lesson.findMany({ where: { moduleId: c2m1.id }, take: 2 })
  await prisma.lessonProgress.createMany({
    data: c2m1Lessons.map((l) => ({
      userId: student.id,
      lessonId: l.id,
      watchedSecs: Math.round((l.durationSecs ?? 0) * 0.8),
      completed: true,
      completedAt: new Date(),
    })),
  })

  const course1Lessons = await prisma.lesson.findMany({ where: { module: { courseId: course1.id } } })
  await prisma.lessonProgress.createMany({
    data: course1Lessons.map((l) => ({
      userId: student2.id,
      lessonId: l.id,
      watchedSecs: l.durationSecs ?? 0,
      completed: true,
      completedAt: new Date(),
    })),
  })

  const c2Lessons3 = await prisma.lesson.findMany({ where: { module: { courseId: course2.id } }, take: 3 })
  await prisma.lessonProgress.createMany({
    data: c2Lessons3.map((l) => ({
      userId: student2.id,
      lessonId: l.id,
      watchedSecs: l.durationSecs ?? 0,
      completed: true,
      completedAt: new Date(),
    })),
  })

  const c1Lessons2 = await prisma.lesson.findMany({ where: { module: { courseId: course1.id } }, take: 2 })
  await prisma.lessonProgress.createMany({
    data: c1Lessons2.map((l) => ({
      userId: student3.id,
      lessonId: l.id,
      watchedSecs: l.durationSecs ?? 0,
      completed: true,
      completedAt: new Date(),
    })),
  })
  console.log('✅ Progresso simulado criado')

  // ── LOGS DE ACESSO ────────────────────────────────────────────────
  await prisma.loginLog.createMany({
    data: [
      { userId: student.id },
      { userId: student.id },
      { userId: student2.id },
      { userId: student2.id },
      { userId: student2.id },
      { userId: student3.id },
      { userId: admin.id },
    ],
  })

  await prisma.user.updateMany({
    where: { id: { in: [student.id, student2.id, student3.id, admin.id, supervisora.id] } },
    data: { lastAccessAt: new Date() },
  })

  // ── PLATAFORMA CONFIG ──────────────────────────────────────────────
  await prisma.platformConfig.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      platformName: 'Universo Mil',
      primaryColor: '#EC55B5',
      instagramUrl: 'https://www.instagram.com/milbijus/',
      facebookUrl: 'https://www.facebook.com/MilBijus/?locale=pt_BR',
    },
    update: {
      instagramUrl: 'https://www.instagram.com/milbijus/',
      facebookUrl: 'https://www.facebook.com/MilBijus/?locale=pt_BR',
    },
  })

  // ── POP ────────────────────────────────────────────────────────────
  const pop = await prisma.pOPDocument.create({
    data: {
      title: 'Abertura de Loja',
      slug: 'abertura-de-loja',
      category: 'Operacional',
      order: 0,
      status: 'PUBLISHED',
      content: `# Procedimento de Abertura de Loja\n\n## Objetivo\nGarantir que a loja seja aberta de forma padronizada e segura.\n\n## Passo a passo\n\n1. **Chegada** — Chegar com 15 minutos de antecedência\n2. **Segurança** — Verificar alarme e cameras\n3. **Limpeza** — Verificar limpeza geral\n4. **Vitrine** — Organizar conforme planograma\n5. **Caixa** — Conferir troco inicial\n6. **Sistemas** — Ligar computador e sistemas de PDV\n\n## Responsável\nSupervisora ou Gerente de Loja`,
      createdById: admin.id,
    },
  })
  console.log('✅ POP criado:', pop.title)

  // ── PESQUISA DE CLIMA ──────────────────────────────────────────────
  const climateResearch = await prisma.climateResearch.create({
    data: {
      title: 'Pesquisa de Clima — Junho 2026',
      description: 'Sua opinião é muito importante para melhorarmos o ambiente de trabalho.',
      isActive: true,
      isAnonymous: true,
      questions: {
        create: [
          { text: 'Como você avalia o ambiente de trabalho na sua loja?', type: 'SCALE', scaleMin: 1, scaleMax: 5, order: 1 },
          { text: 'Você se sente reconhecida pelo seu trabalho?', type: 'SCALE', scaleMin: 1, scaleMax: 5, order: 2 },
          { text: 'Como é a comunicação com a sua liderança direta?', type: 'SCALE', scaleMin: 1, scaleMax: 5, order: 3 },
          { text: 'Você indicaria a empresa como um bom lugar para trabalhar?', type: 'SCALE', scaleMin: 1, scaleMax: 10, order: 4 },
          { text: 'O que poderia melhorar no seu dia a dia de trabalho?', type: 'TEXT', required: false, order: 5 },
        ],
      },
    },
  })
  console.log('✅ Pesquisa de Clima criada:', climateResearch.title)

  // ── CHECKLIST ──────────────────────────────────────────────────────
  const checklist = await prisma.checklistTemplate.create({
    data: {
      title: 'Checklist de Padronização de Loja',
      description: 'Avaliação mensal de conformidade com os padrões da marca.',
      status: 'ACTIVE',
      items: {
        create: [
          { text: 'Vitrine organizada conforme manual de visual merchandising', category: 'Vitrine', order: 1 },
          { text: 'Iluminação da vitrine funcionando corretamente', category: 'Vitrine', order: 2 },
          { text: 'Organização interna: produtos etiquetados e dispostos por categoria', category: 'Organização', order: 3 },
          { text: 'Área de caixa limpa e sem acúmulo de objetos', category: 'Organização', order: 4 },
          { text: 'Piso e superfícies limpos e sem poeira', category: 'Higiene', order: 5 },
          { text: 'Banheiro (se houver) limpo e abastecido', category: 'Higiene', order: 6 },
          { text: 'Colaboradoras com uniforme completo e adequado', category: 'Uniformes', order: 7 },
          { text: 'Crachás de identificação visíveis em todas as colaboradoras', category: 'Uniformes', order: 8 },
        ],
      },
    },
  })
  console.log('✅ Checklist criado:', checklist.title)

  // ── NPS ────────────────────────────────────────────────────────────
  const nps = await prisma.nPSCampaign.create({
    data: {
      title: 'NPS Líderes — Junho 2026',
      description: 'Avaliação de satisfação das lideranças com a gestão e a empresa.',
      isActive: true,
      questions: {
        create: [
          { text: 'De 0 a 10, o quanto você recomendaria trabalhar aqui para uma amiga?', type: 'SCALE', order: 0 },
          { text: 'O que mais te satisfaz no trabalho?', type: 'TEXT', order: 1 },
        ],
      },
    },
  })
  console.log('✅ Campanha NPS Líderes criada:', nps.title)

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('   admin@demo.com.br              /  teste123  (ADMIN)')
  console.log('   lojacentro@demo.com.br         /  teste123  (Loja Centro)')
  console.log('   lojashopping@demo.com.br       /  teste123  (Loja Shopping)')
  console.log('   lojanorte@demo.com.br          /  teste123  (Loja Norte)')
  console.log('   teste@plataforma.com           /  teste123  (COLABORADOR)')
  console.log('   supervisao@plataforma.com      /  teste123  (SUPERVISAO)')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
