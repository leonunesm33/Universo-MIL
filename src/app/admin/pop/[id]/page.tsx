import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EditPOPForm } from './EditPOPForm'

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: 'Admin — Editar POP' }

export default async function EditPOPPage({ params }: Props) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/homepage')

  const { id } = await params
  const doc = await prisma.pOPDocument.findUnique({ where: { id } })
  if (!doc) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <EditPOPForm doc={doc} />
    </div>
  )
}
