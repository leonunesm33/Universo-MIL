'use client'

interface Store {
  id: string
  name: string
}

interface StoreFilterProps {
  stores: Store[]
  currentStoreId?: string
  compact?: boolean
}

export function StoreFilter({ stores, currentStoreId, compact }: StoreFilterProps) {
  if (stores.length === 0) return null

  return (
    <form method="GET">
      <select
        name="storeId"
        defaultValue={currentStoreId ?? ''}
        onChange={(e) => e.currentTarget.form!.submit()}
        className={`rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white ${
          compact ? 'text-xs py-1.5' : ''
        }`}
      >
        <option value="">Todas as lojas</option>
        {stores.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </form>
  )
}
