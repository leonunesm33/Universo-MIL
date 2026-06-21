'use client'

import { useState } from 'react'
import Link from 'next/link'
import { YouTubePlayer } from './YouTubePlayer'
import { ConcluirButton } from './ConcluirButton'
import { FavoriteButton } from './FavoriteButton'
import { LikeButtons } from './LikeButtons'

interface LessonVideoSectionProps {
  videoId: string | null
  lessonId: string
  durationSecs: number
  initialWatchedSecs: number
  initialCompleted: boolean
  prevHref: string | null
  nextHref: string | null
  initialLike: 'LIKE' | 'DISLIKE' | null
  likeCount: number
  dislikeCount: number
  isFavorited: boolean
}

export function LessonVideoSection({
  videoId,
  lessonId,
  durationSecs,
  initialWatchedSecs,
  initialCompleted,
  prevHref,
  nextHref,
  initialLike,
  likeCount,
  dislikeCount,
  isFavorited,
}: LessonVideoSectionProps) {
  const [videoCompleted, setVideoCompleted] = useState(false)

  const effectiveVideoCompleted = !videoId || videoCompleted

  return (
    <>
      {/* Player */}
      <div className="w-full bg-black overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {videoId ? (
          <YouTubePlayer
            videoId={videoId}
            lessonId={lessonId}
            durationSecs={durationSecs}
            initialWatchedSecs={initialWatchedSecs}
            onVideoCompleted={() => setVideoCompleted(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#111]">
            <span className="text-gray-600 text-sm">Sem vídeo disponível</span>
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between mt-3 pb-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          {prevHref ? (
            <Link
              href={prevHref}
              aria-label="Aula anterior"
              className="w-11 h-11 rounded-lg border border-[#333] flex items-center justify-center text-gray-400 hover:border-[#555] hover:text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            </Link>
          ) : (
            <span aria-disabled="true" aria-label="Sem aula anterior" className="w-11 h-11 rounded-lg border border-[#1a1a1a] flex items-center justify-center text-gray-700">
              <svg viewBox="0 0 16 16" className="w-4 h-4" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            </span>
          )}

          <ConcluirButton
            lessonId={lessonId}
            initialCompleted={initialCompleted}
            videoCompleted={effectiveVideoCompleted}
          />

          {nextHref ? (
            <Link
              href={nextHref}
              aria-label="Próxima aula"
              className="w-11 h-11 rounded-lg border border-[#333] flex items-center justify-center text-gray-400 hover:border-[#555] hover:text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            </Link>
          ) : (
            <span aria-disabled="true" aria-label="Sem próxima aula" className="w-11 h-11 rounded-lg border border-[#1a1a1a] flex items-center justify-center text-gray-700">
              <svg viewBox="0 0 16 16" className="w-4 h-4" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FavoriteButton lessonId={lessonId} initialFavorited={isFavorited} />
          <LikeButtons
            lessonId={lessonId}
            initialLike={initialLike}
            likeCount={likeCount}
            dislikeCount={dislikeCount}
          />
        </div>
      </div>
    </>
  )
}
