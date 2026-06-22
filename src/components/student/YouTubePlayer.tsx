'use client'

import { useEffect, useRef } from 'react'

interface YouTubePlayerProps {
  videoId: string
  lessonId: string
  durationSecs: number
  initialWatchedSecs?: number
  onVideoCompleted?: () => void
  onAutoComplete?: () => void
}

export function YouTubePlayer({
  videoId,
  lessonId,
  durationSecs,
  initialWatchedSecs = 0,
  onVideoCompleted,
  onAutoComplete,
}: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const completedFiredRef = useRef(false)
  const autoCompleteFiredRef = useRef(false)
  // Always-fresh refs so the YT event handler never captures a stale closure
  const onVideoCompletedRef = useRef(onVideoCompleted)
  const onAutoCompleteRef = useRef(onAutoComplete)

  useEffect(() => { onVideoCompletedRef.current = onVideoCompleted }, [onVideoCompleted])
  useEffect(() => { onAutoCompleteRef.current = onAutoComplete }, [onAutoComplete])

  useEffect(() => {
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script')
      tag.id = 'youtube-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }

    const prev = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev()
      if (!containerRef.current) return
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          controls: 1,
          rel: 0,
          modestbranding: 1,
          start: Math.floor(initialWatchedSecs),
        },
        events: {
          onStateChange: (event: { data: number }) => {
            // ENDED fires immediately — don't wait for the 5-second poll
            if (event.data !== YT.PlayerState.ENDED) return
            if (!completedFiredRef.current) {
              completedFiredRef.current = true
              onVideoCompletedRef.current?.()
            }
            if (!autoCompleteFiredRef.current) {
              autoCompleteFiredRef.current = true
              onAutoCompleteRef.current?.()
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      window.onYouTubeIframeAPIReady()
    }

    return () => {
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId, initialWatchedSecs])

  useEffect(() => {
    const interval = setInterval(async () => {
      const player = playerRef.current
      if (!player || typeof player.getPlayerState !== 'function') return

      const state = player.getPlayerState()
      if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.ENDED) return

      const watchedSecs = Math.floor(player.getCurrentTime())
      const totalDuration = player.getDuration() > 0 ? player.getDuration() : durationSecs
      const pct = totalDuration > 0 ? watchedSecs / totalDuration : 0

      if (pct >= 0.90 && !completedFiredRef.current) {
        completedFiredRef.current = true
        onVideoCompleted?.()
      }

      if ((pct >= 0.99 || state === YT.PlayerState.ENDED) && !autoCompleteFiredRef.current) {
        autoCompleteFiredRef.current = true
        onAutoComplete?.()
      }

      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchedSecs, completed: autoCompleteFiredRef.current }),
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [lessonId, durationSecs, onVideoCompleted, onAutoComplete])

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
