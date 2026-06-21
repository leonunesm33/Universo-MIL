'use client'

import { useState } from 'react'

interface Lesson {
  id: string
  title: string
  courseName: string
  likes: number
  dislikes: number
  likeRatio: number
}

interface LikedDislikedTabsProps {
  topLiked: Lesson[]
  topDisliked: Lesson[]
}

export function LikedDislikedTabs({ topLiked, topDisliked }: LikedDislikedTabsProps) {
  const [tab, setTab] = useState<'liked' | 'disliked'>('liked')

  const items = tab === 'liked' ? topLiked : topDisliked

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 mb-3 border-b border-slate-100">
        <button
          onClick={() => setTab('liked')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
            tab === 'liked'
              ? 'border-emerald-500 text-emerald-700 bg-white'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>👍</span> Curtidas
        </button>
        <button
          onClick={() => setTab('disliked')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
            tab === 'disliked'
              ? 'border-rose-500 text-rose-700 bg-white'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>👎</span> Não curtidas
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400 py-2">Sem dados ainda.</p>
      ) : (
        <div className="space-y-2.5 flex-1">
          {items.map((lesson, i) => (
            <div key={lesson.id} className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-300 w-4 text-right shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate leading-tight">{lesson.title}</p>
                <p className="text-[11px] text-slate-400 truncate">{lesson.courseName}</p>
              </div>
              <div
                className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${
                  tab === 'liked'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {tab === 'liked' ? lesson.likeRatio : 100 - lesson.likeRatio}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
