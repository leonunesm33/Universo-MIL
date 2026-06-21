'use client'

import { useState, useTransition } from 'react'
import { createStore, updateStore, toggleStore, deleteStore } from '../actions/config'
import { toast } from 'sonner'

interface Store {
  id: string
  name: string
  code: string | null
  isActive: boolean
  _count: { users: number }
}

function StoreModal({
  store,
  onClose,
}: {
  store?: Store
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState(store?.name ?? '')
  const [code, setCode] = useState(store?.code ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('name', name)
    fd.set('code', code)
    startTransition(async () => {
      try {
        if (store) {
          await updateStore(store.id, fd)
          toast.success('Loja atualizada!')
        } else {
          await createStore(fd)
          toast.success('Loja criada!')
        }
        onClose()
      } catch {
        toast.error('Erro ao salvar loja')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {store ? 'Editar Loja' : 'Nova Loja'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Nome da Loja *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
              placeholder="Ex: Loja Centro"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Código <span className="text-slate-400 font-normal normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-brand"
              placeholder="Ex: CENTRO"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              {pending ? 'Salvando…' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteStoreButton({ store }: { store: Store }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteStore(store.id)
        toast.success('Loja excluída!')
      } catch {
        toast.error('Erro ao excluir loja')
      }
    })
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        {store._count.users > 0 && (
          <span className="text-xs text-amber-600">{store._count.users} usuário(s)</span>
        )}
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-xs text-red-600 font-medium hover:text-red-700 disabled:opacity-50"
        >
          {pending ? '…' : 'Confirmar'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-xs text-slate-400 hover:text-slate-600">
          Cancelar
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-red-400 hover:text-red-600 font-medium"
    >
      Excluir
    </button>
  )
}

function ToggleStoreButton({ store }: { store: Store }) {
  const [pending, startTransition] = useTransition()

  function handle() {
    startTransition(async () => {
      try {
        await toggleStore(store.id, !store.isActive)
      } catch {
        toast.error('Erro ao alterar status')
      }
    })
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className={`text-xs font-medium px-2 py-1 rounded transition-colors disabled:opacity-50 ${
        store.isActive
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-green-50 text-green-700 hover:bg-green-100'
      }`}
    >
      {pending ? '…' : store.isActive ? 'Desativar' : 'Ativar'}
    </button>
  )
}

export function LojasTab({ stores }: { stores: Store[] }) {
  const [modalStore, setModalStore] = useState<Store | 'new' | null>(null)

  return (
    <div>
      {modalStore && (
        <StoreModal
          store={modalStore === 'new' ? undefined : modalStore}
          onClose={() => setModalStore(null)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{stores.length} loja{stores.length !== 1 ? 's' : ''} cadastrada{stores.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setModalStore('new')}
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Loja
        </button>
      </div>

      {stores.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p>Nenhuma loja cadastrada.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-left">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Usuários</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{store.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{store.code ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{store._count.users}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      store.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {store.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalStore(store)}
                        className="text-xs text-brand hover:text-brand/80 font-medium"
                      >
                        Editar
                      </button>
                      <ToggleStoreButton store={store} />
                      <DeleteStoreButton store={store} />
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
