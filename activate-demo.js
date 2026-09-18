const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()
const EMAILS = ['colaborador@demo.com.br','gerente@demo.com.br','supervisora@demo.com.br']
async function main() {
  const hash = await bcrypt.hash('teste123', 10)
  for (const email of EMAILS) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) { console.log('NAO ENCONTRADO: ' + email); continue }
    await prisma.user.update({ where: { email }, data: { passwordHash: hash } })
    console.log('ATIVADO: ' + email + ' role=' + user.role)
  }
}
main().then(() => prisma['']()).catch(async e => { console.error(e); await prisma[''](); process.exit(1) })
