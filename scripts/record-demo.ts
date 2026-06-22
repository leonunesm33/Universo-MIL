/**
 * record-demo.ts — Gravação automática do vídeo de apresentação Universo Mil
 *
 * Executa as 15 cenas do roteiro prompt-demo-video.md com Playwright.
 * A gravação é feita pelo Playwright (recordVideo) e salva em /videos/demo.webm
 *
 * Como rodar:
 *   cd D:\Projetos\Learn_plataform
 *   npx tsx scripts/record-demo.ts
 *
 * Pré-requisito: plataforma rodando em http://localhost:3000
 *                Dados de demo carregados (npx tsx prisma/seed-demo.ts)
 */

import { chromium, Page, BrowserContext } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000'
const VIDEO_WIDTH = 1920
const VIDEO_HEIGHT = 1080
const VIDEO_DIR = path.join(__dirname, '..', 'videos')

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/** Scroll suave via mouse.wheel — evita page.evaluate e o problema de __name do tsx/esbuild */
async function smoothScroll(page: Page, deltaY: number, durationMs = 1400) {
  const steps = Math.max(8, Math.round(durationMs / 50))
  const stepSize = deltaY / steps
  const delay = durationMs / steps
  // Move o cursor para o centro da tela para garantir que o scroll vai para o elemento certo
  await page.mouse.move(VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2)
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepSize)
    await wait(delay)
  }
}

/** Hover suave num elemento */
async function hoverEl(page: Page, selector: string) {
  try {
    await page.locator(selector).first().hover({ timeout: 3000 })
    await wait(300)
  } catch { /* ignora se não encontrar */ }
}

/** Preenche input React com type char-a-char para disparar onChange */
async function fillReact(page: Page, selector: string, value: string) {
  const el = page.locator(selector).first()
  await el.click()
  await wait(200)
  // Limpa com triple-click + Delete para não conflitar com valor anterior
  await el.selectText().catch(() => {})
  await page.keyboard.press('Control+a')
  await page.keyboard.press('Delete')
  await wait(100)
  await page.keyboard.type(value, { delay: 70 })
  await wait(200)
}

/** Clica em item de navegação pelo texto */
async function navClick(page: Page, label: string, waitUrl?: string) {
  const locator = page.getByText(label, { exact: true }).first()
  await locator.hover()
  await wait(300)
  await locator.click()
  if (waitUrl) {
    await page.waitForURL(`**${waitUrl}**`, { timeout: 8000 }).catch(() => {})
  }
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await wait(600)
}

/** Injeta cursor visual rosa no DOM */
async function injectCursor(page: Page) {
  await page.addStyleTag({
    content: `
      #pw-cursor {
        position: fixed !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        width: 22px; height: 22px;
        border-radius: 50%;
        background: rgba(236,85,181,0.75);
        border: 2px solid rgba(255,255,255,0.9);
        box-shadow: 0 2px 12px rgba(0,0,0,0.5);
        transform: translate(-50%,-50%);
        transition: left 60ms linear, top 60ms linear;
        left: -100px; top: -100px;
      }
    `,
  })
  // String passada diretamente — tsx não transforma, __name não é injetado no browser
  await page.evaluate(`
    (function() {
      if (document.getElementById('pw-cursor')) return;
      var el = document.createElement('div');
      el.id = 'pw-cursor';
      document.body.appendChild(el);
      document.addEventListener('mousemove', function(e) {
        var c = document.getElementById('pw-cursor');
        if (c) { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }
      }, { passive: true });
    })()
  `)
}

/** Garante cursor injetado após cada navegação */
async function afterNav(page: Page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 8000 }).catch(() => {})
  await wait(400)
  await injectCursor(page)
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await afterNav(page)
  await wait(1000)

  await fillReact(page, 'input[type="email"]', email)
  await wait(400)
  await fillReact(page, 'input[type="password"]', password)
  await wait(500)

  await hoverEl(page, 'button[type="submit"]')
  await page.locator('button[type="submit"]').first().click()
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 12000 }).catch(() => {})
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
}

// ─── SCENES ───────────────────────────────────────────────────────────────────

/** CENA 1 — Tela de login (15s) */
async function scene01_login(page: Page) {
  console.log('🎬 Cena 1 — Login')
  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await afterNav(page)
  await wait(2500)  // espectador lê o layout

  await fillReact(page, 'input[type="email"]', 'admin@demo.com')
  await wait(600)
  await fillReact(page, 'input[type="password"]', 'Demo@2024')
  await wait(700)
  await hoverEl(page, 'button[type="submit"]')
  await page.locator('button[type="submit"]').first().click()

  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 12000 }).catch(() => {})
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(1000)
}

/** CENA 2 — Dashboard Admin (30s) */
async function scene02_dashboard(page: Page) {
  console.log('🎬 Cena 2 — Dashboard')
  // Garante que estamos no dashboard
  if (!page.url().includes('/admin')) {
    await page.goto(`${BASE_URL}/admin`)
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await afterNav(page)
  }
  await wait(3000)  // espectador absorve a visão geral

  // Scroll suave mostrando todos os cards e gráficos
  await smoothScroll(page, 400, 1500)
  await wait(1200)
  await smoothScroll(page, 500, 1500)
  await wait(1200)
  await smoothScroll(page, 500, 1500)
  await wait(1500)

  // Volta ao topo para demonstrar filtro por loja
  await smoothScroll(page, -1500, 1200)
  await wait(800)

  // Filtro por loja — procura select
  const storeSelect = page.locator('select').first()
  const hasSelect = await storeSelect.count() > 0
  if (hasSelect) {
    await storeSelect.hover()
    await wait(400)
    await storeSelect.selectOption({ label: 'Loja Centro' })
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    await wait(2000)
    await storeSelect.selectOption({ index: 0 })  // volta para "Todas"
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    await wait(1500)
  } else {
    // Tenta clicar em um filtro de loja por texto
    const filterBtn = page.getByText('Todas as lojas').first()
    if (await filterBtn.count() > 0) {
      await filterBtn.hover()
      await wait(500)
    }
    await wait(2000)
  }
}

/** CENA 3 — Sidebar expandida (10s) */
async function scene03_sidebar(page: Page) {
  console.log('🎬 Cena 3 — Sidebar')
  // Tenta expandir a sidebar
  const expandBtn = page.locator('[aria-label*="xpand"], [aria-label*="brir"], button[title*="sidebar"], button.sidebar-toggle').first()
  const btnCount = await expandBtn.count()
  if (btnCount > 0) {
    await expandBtn.hover()
    await wait(400)
    await expandBtn.click()
    await wait(2500)
    await expandBtn.click()  // recolhe
    await wait(1000)
  } else {
    // Sidebar pode já estar expandida ou não ter toggle visível
    await wait(2500)
  }
}

/** CENA 4 — Plataforma / Cursos (25s) */
async function scene04_cursos(page: Page) {
  console.log('🎬 Cena 4 — Cursos')
  // Navega para Plataforma
  const platLink = page.getByRole('link', { name: /plataforma/i }).first()
  const platLinkCount = await platLink.count()
  if (platLinkCount > 0) {
    await platLink.hover()
    await wait(300)
    await platLink.click()
  } else {
    await page.goto(`${BASE_URL}/admin/plataforma`)
  }
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)

  // Clica em Editar no primeiro curso
  const editBtn = page.getByRole('link', { name: /editar/i }).first()
  const editCount = await editBtn.count()
  if (editCount > 0) {
    await editBtn.hover()
    await wait(400)
    await editBtn.click()
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await afterNav(page)
    await wait(2000)

    // Scroll mostrando campos de edição
    await smoothScroll(page, 300, 1200)
    await wait(1200)

    // Tenta expandir um módulo
    const moduleBtn = page.locator('button, [role="button"]').filter({ hasText: /módulo|module/i }).first()
    if (await moduleBtn.count() > 0) {
      await moduleBtn.hover()
      await wait(400)
      await moduleBtn.click()
      await wait(1500)
    }

    // Mostra botão de adicionar aula ou editar
    const lessonBtn = page.getByText(/editar aula|adicionar aula|nova aula/i).first()
    if (await lessonBtn.count() > 0) {
      await lessonBtn.hover()
      await wait(400)
    }
    await wait(1000)

    // Tenta abrir modal de aula
    const addLessonBtn = page.getByRole('button', { name: /aula|lesson/i }).first()
    if (await addLessonBtn.count() > 0) {
      await addLessonBtn.hover()
      await wait(300)
      await addLessonBtn.click()
      await wait(1500)
      // Fecha o modal
      const closeBtn = page.getByRole('button', { name: /fechar|cancelar|close/i }).first()
      if (await closeBtn.count() > 0) {
        await closeBtn.hover()
        await wait(300)
        await closeBtn.click()
        await wait(800)
      } else {
        await page.keyboard.press('Escape')
        await wait(800)
      }
    }

    // Volta para lista de cursos
    await page.goto(`${BASE_URL}/admin/plataforma`)
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await afterNav(page)
    await wait(1000)
  }
}

/** CENA 5 — Avaliações (20s) */
async function scene05_avaliacoes(page: Page) {
  console.log('🎬 Cena 5 — Avaliações')
  await page.goto(`${BASE_URL}/admin/avaliacoes`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)

  // Clica na primeira avaliação para editar
  const editLink = page.getByRole('link', { name: /editar|ver/i }).first()
  if (await editLink.count() > 0) {
    await editLink.hover()
    await wait(300)
    await editLink.click()
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await afterNav(page)
    await wait(2500)
    // Mostra a primeira pergunta expandida
    await smoothScroll(page, 200, 1000)
    await wait(1500)

    // Volta para lista
    await page.goto(`${BASE_URL}/admin/avaliacoes`)
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await afterNav(page)
    await wait(800)
  }
}

/** CENA 6 — Alunos (15s) */
async function scene06_alunos(page: Page) {
  console.log('🎬 Cena 6 — Alunos')
  await page.goto(`${BASE_URL}/admin/alunos`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)

  // Abre modal de convite
  const inviteBtn = page.getByRole('button', { name: /convidar|novo|invite/i }).first()
  if (await inviteBtn.count() > 0) {
    await inviteBtn.hover()
    await wait(400)
    await inviteBtn.click()
    await wait(1500)
    // Fecha sem enviar — tenta botão Cancelar primeiro, depois Escape
    const cancelBtn = page.getByRole('button', { name: /cancelar|fechar|cancel|close/i }).first()
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click()
    } else {
      await page.keyboard.press('Escape')
    }
    // Aguarda modal sumir (z-50 overlay desaparecer)
    await page.locator('.fixed.inset-0').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    await wait(800)
  }

  // Clica em uma aluna para abrir perfil
  const userRow = page.locator('tbody tr').first()
  if (await userRow.count() > 0) {
    await userRow.hover({ force: true })
    await wait(400)
    await userRow.click({ force: true })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await afterNav(page)
    await wait(2000)
    await page.goBack()
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    await afterNav(page)
    await wait(500)
  }
}

/** CENA 7 — Relatórios e Ranking (20s) */
async function scene07_relatorios(page: Page) {
  console.log('🎬 Cena 7 — Relatórios e Ranking')
  await page.goto(`${BASE_URL}/admin/relatorios`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)

  // Filtro de loja
  const storeSelect = page.locator('select').first()
  if (await storeSelect.count() > 0) {
    await storeSelect.hover()
    await wait(400)
    await storeSelect.selectOption({ label: 'Loja Shopping' }).catch(() =>
      storeSelect.selectOption({ index: 1 })
    )
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    await wait(1500)
    await storeSelect.selectOption({ index: 0 })
    await wait(1000)
  }

  // Scroll para ver paginação
  await smoothScroll(page, 400, 1200)
  await wait(1200)
  await smoothScroll(page, -400, 1000)
  await wait(500)

  // Ranking
  await page.goto(`${BASE_URL}/admin/ranking`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)
  await smoothScroll(page, 300, 1200)
  await wait(1500)

  // Filtro por loja no ranking
  const rankSelect = page.locator('select').first()
  if (await rankSelect.count() > 0) {
    await rankSelect.hover()
    await wait(300)
    await rankSelect.selectOption({ index: 1 }).catch(() => {})
    await wait(1200)
    await rankSelect.selectOption({ index: 0 }).catch(() => {})
    await wait(800)
  }
}

/** CENA 8 — Clima, Checklist, NPS (35s) */
async function scene08_clima_checklist_nps(page: Page) {
  console.log('🎬 Cena 8 — Clima, Checklist, NPS')

  // Clima
  await page.goto(`${BASE_URL}/admin/clima`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)

  const climaLink = page.getByRole('link').first()
  if (await climaLink.count() > 0) {
    await climaLink.hover()
    await wait(300)
    await climaLink.click()
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await afterNav(page)
    await wait(1500)
    await smoothScroll(page, 400, 1200)
    await wait(1500)
    await page.goto(`${BASE_URL}/admin/clima`)
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    await afterNav(page)
    await wait(500)
  }

  // Checklist
  await page.goto(`${BASE_URL}/admin/checklist`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(1500)

  const clLink = page.getByRole('link').first()
  if (await clLink.count() > 0) {
    await clLink.hover()
    await wait(300)
    await clLink.click()
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await afterNav(page)
    await wait(1500)
    await smoothScroll(page, 400, 1200)
    await wait(1500)
    await page.goto(`${BASE_URL}/admin/checklist`)
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    await afterNav(page)
    await wait(500)
  }

  // NPS
  await page.goto(`${BASE_URL}/admin/satisfacao`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(1500)

  const npsLink = page.getByRole('link').first()
  if (await npsLink.count() > 0) {
    await npsLink.hover()
    await wait(300)
    await npsLink.click()
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await afterNav(page)
    await wait(1500)
    await smoothScroll(page, 300, 1000)
    await wait(1500)
  }
}

/** CENA 9 — Configurações (15s) */
async function scene09_config(page: Page) {
  console.log('🎬 Cena 9 — Configurações')
  await page.goto(`${BASE_URL}/admin/configuracoes?tab=identidade`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2500)

  // Aba Lojas
  const lojaTab = page.getByText('Lojas', { exact: true }).first()
  if (await lojaTab.count() > 0) {
    await lojaTab.hover()
    await wait(300)
    await lojaTab.click()
    await wait(1500)
  }

  // Aba Grupos
  const gruposTab = page.getByText('Grupos', { exact: true }).first()
  if (await gruposTab.count() > 0) {
    await gruposTab.hover()
    await wait(300)
    await gruposTab.click()
    await wait(1800)
  }
}

/** CENA 10 — Logout e login como supervisora (10s) */
async function scene10_logout_supervisora(page: Page) {
  console.log('🎬 Cena 10 — Logout → Supervisora')

  // Clica no avatar / botão de sair — tenta diferentes seletores
  const logoutBtn = page.getByRole('button', { name: /sair|logout|sign out/i }).first()
  const logoutLink = page.getByText(/sair/i).first()

  if (await logoutBtn.count() > 0) {
    await logoutBtn.hover()
    await wait(400)
    await logoutBtn.click()
  } else if (await logoutLink.count() > 0) {
    await logoutLink.hover()
    await wait(400)
    await logoutLink.click()
  } else {
    // Fallback: vai direto para login
    await page.goto(`${BASE_URL}/login`)
  }

  await page.waitForURL(url => url.href.includes('/login'), { timeout: 8000 }).catch(() => {
    page.goto(`${BASE_URL}/login`)
  })
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(800)

  // Login como supervisora
  await fillReact(page, 'input[type="email"]', 'supervisora@demo.com')
  await wait(500)
  await fillReact(page, 'input[type="password"]', 'Demo@2024')
  await wait(500)
  await page.locator('button[type="submit"]').first().click()
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 12000 }).catch(() => {})
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(1000)
}

/** CENA 11 — Painel Admin visão SUPERVISAO (10s) */
async function scene11_admin_supervisao(page: Page) {
  console.log('🎬 Cena 11 — Admin (SUPERVISAO)')
  // Tenta clicar em "Painel Admin" no header da área aluna
  const adminPanelLink = page.getByText(/painel admin/i).first()
  if (await adminPanelLink.count() > 0) {
    await adminPanelLink.hover()
    await wait(300)
    await adminPanelLink.click()
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await afterNav(page)
  } else {
    await page.goto(`${BASE_URL}/admin`)
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await afterNav(page)
  }
  await wait(2000)

  // Mostra que sidebar só tem seção de Análise (sem seção Gestão)
  await smoothScroll(page, 0, 500)
  await wait(1500)

  // Tenta navegar para /admin/plataforma — deve ser redirecionado
  await page.goto(`${BASE_URL}/admin/plataforma`)
  await wait(1500)
  // Volta para dashboard admin
  await page.goto(`${BASE_URL}/admin`)
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  await afterNav(page)
  await wait(1000)
}

/** CENA 12 — Área de aprendizagem (40s) */
async function scene12_aprendizagem(page: Page) {
  console.log('🎬 Cena 12 — Aprendizagem')
  // Homepage aluna
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)
  await smoothScroll(page, 300, 1200)
  await wait(1200)
  await smoothScroll(page, -300, 1000)
  await wait(800)

  // Clica num curso
  const courseLink = page.getByRole('link', { name: /boas-vindas|atendimento|curso/i }).first()
  if (await courseLink.count() > 0) {
    await courseLink.hover()
    await wait(400)
    await courseLink.click()
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await afterNav(page)
    await wait(2000)

    // Clica em uma aula — pega a primeira aula disponível
    const lessonLink = page.locator('a[href*="/curso/"]').first()
    if (await lessonLink.count() > 0) {
      await lessonLink.hover()
      await wait(400)
      await lessonLink.click()
      await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {})
      await afterNav(page)
      await wait(2000)

      // Scroll mostrando player + controles + descrição + likes
      await smoothScroll(page, 300, 1200)
      await wait(1500)
      await smoothScroll(page, 200, 1000)
      await wait(1500)
    }
  }

  // Módulo concluído → card de avaliação (Cena 12 — supervisora tem módulo 1 completo)
  // Navega para o curso com módulo concluído
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  await afterNav(page)
  await wait(500)

  const boasVindasLink = page.getByText(/boas-vindas/i).first()
  if (await boasVindasLink.count() > 0) {
    await boasVindasLink.hover()
    await wait(300)
    await boasVindasLink.click()
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await afterNav(page)
    await wait(2000)
    // O módulo 1 está concluído para a supervisora → deve mostrar card de avaliação
    await smoothScroll(page, 300, 1200)
    await wait(2000)
  }

  // Perfil / Certificados
  await page.goto(`${BASE_URL}/perfil`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)
  await smoothScroll(page, 300, 1200)
  await wait(1500)
}

/** CENA 13 — Checklist área aluna (20s) */
async function scene13_checklist_aluno(page: Page) {
  console.log('🎬 Cena 13 — Checklist (aluno)')
  await page.goto(`${BASE_URL}/checklist`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)

  // Clica em Iniciar
  const iniciarBtn = page.getByRole('button', { name: /iniciar|responder/i }).first()
  if (await iniciarBtn.count() > 0) {
    await iniciarBtn.hover()
    await wait(400)
    await iniciarBtn.click()
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await afterNav(page)
    await wait(1500)

    // Marca alguns itens como OK e um como não conforme
    const checkboxes = page.locator('input[type="checkbox"], button[role="checkbox"]')
    const count = await checkboxes.count()
    for (let i = 0; i < Math.min(count, 4); i++) {
      const cb = checkboxes.nth(i)
      await cb.hover()
      await wait(250)
      await cb.click()
      await wait(200)
    }
    await wait(1000)

    // Cancela / volta
    const cancelBtn = page.getByRole('button', { name: /cancelar|voltar/i }).first()
    if (await cancelBtn.count() > 0) {
      await cancelBtn.hover()
      await wait(300)
      await cancelBtn.click()
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
      await afterNav(page)
    } else {
      await page.goto(`${BASE_URL}/checklist`)
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
      await afterNav(page)
    }
    await wait(800)
    // Mostra histórico de respostas
    await smoothScroll(page, 500, 1200)
    await wait(2000)
  }
}

/** CENA 14 — Minha Equipe, Perfil, POP (25s) */
async function scene14_equipe_perfil_pop(page: Page) {
  console.log('🎬 Cena 14 — Equipe, Perfil, POP')

  // Minha Equipe
  await page.goto(`${BASE_URL}/minha-equipe`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2500)
  await smoothScroll(page, 300, 1200)
  await wait(1500)

  // Perfil
  await page.goto(`${BASE_URL}/perfil`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)

  // Hover em "Alterar foto"
  const photoBtn = page.getByText(/alterar foto|foto/i).first()
  if (await photoBtn.count() > 0) {
    await photoBtn.hover()
    await wait(800)
  }

  // POP
  await page.goto(`${BASE_URL}/pop`)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)

  // Abre um POP
  const popLink = page.getByRole('link').filter({ hasText: /abertura|fechamento|atendimento|protocolo/i }).first()
  if (await popLink.count() === 0) {
    // Fallback — pega qualquer link
    const anyLink = page.locator('a').filter({ hasText: /.{5,}/ }).first()
    if (await anyLink.count() > 0) {
      await anyLink.hover()
      await wait(300)
      await anyLink.click()
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
      await afterNav(page)
      await wait(1800)
    }
  } else {
    await popLink.hover()
    await wait(300)
    await popLink.click()
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await afterNav(page)
    await wait(1800)
    await smoothScroll(page, 300, 1000)
    await wait(1200)
  }
}

/** CENA 15 — Encerramento (10s) */
async function scene15_encerramento(page: Page) {
  console.log('🎬 Cena 15 — Encerramento')
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await afterNav(page)
  await wait(2000)

  // Zoom suave no logo (scroll para o topo e aguarda)
  await smoothScroll(page, -2000, 1000)
  await wait(5000)  // permanece 5s na tela inicial
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true })

  console.log('🎬 Iniciando gravação do demo Universo Mil...')
  console.log(`   URL: ${BASE_URL}`)
  console.log(`   Vídeo: ${VIDEO_DIR}`)
  console.log()

  const browser = await chromium.launch({
    headless: false,
    args: [
      `--window-size=${VIDEO_WIDTH},${VIDEO_HEIGHT}`,
      '--window-position=0,0',
      '--disable-infobars',
      '--no-default-browser-check',
    ],
  })

  const context = await browser.newContext({
    viewport: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
    },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  })

  // Injeta cursor em cada nova página
  context.on('page', async (p) => {
    await p.waitForLoadState('domcontentloaded').catch(() => {})
    await injectCursor(p).catch(() => {})
  })

  const page = await context.newPage()

  try {
    // Injeta cursor inicial
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {})
    await injectCursor(page)

    await scene01_login(page)
    await scene02_dashboard(page)
    await scene03_sidebar(page)
    await scene04_cursos(page)
    await scene05_avaliacoes(page)
    await scene06_alunos(page)
    await scene07_relatorios(page)
    await scene08_clima_checklist_nps(page)
    await scene09_config(page)
    await scene10_logout_supervisora(page)
    await scene11_admin_supervisao(page)
    await scene12_aprendizagem(page)
    await scene13_checklist_aluno(page)
    await scene14_equipe_perfil_pop(page)
    await scene15_encerramento(page)

    console.log('\n✅ Todas as cenas gravadas!')
  } catch (err) {
    console.error('❌ Erro durante a gravação:', err)
  }

  // Salva o vídeo
  const videoPath = await page.video()?.path()
  await context.close()
  await browser.close()

  if (videoPath) {
    const finalPath = path.join(VIDEO_DIR, 'demo.webm')
    fs.renameSync(videoPath, finalPath)
    console.log(`\n🎥 Vídeo salvo: ${finalPath}`)
    console.log()
    console.log('Para converter para MP4 (H.264), instale o ffmpeg e execute:')
    console.log(`  ffmpeg -i "${finalPath}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "${path.join(VIDEO_DIR, 'demo.mp4')}"`)
  } else {
    console.log('\n⚠️  Arquivo de vídeo não encontrado. Verifique o diretório:', VIDEO_DIR)
    const files = fs.readdirSync(VIDEO_DIR)
    if (files.length > 0) {
      console.log('   Arquivos encontrados:', files.join(', '))
    }
  }
}

main().catch(console.error)
