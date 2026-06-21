'use client'

import { useEffect, useRef } from 'react'

interface YouTubePlayerProps {
  videoId: string
  lessonId: string
  durationSecs: number
  initialWatchedSecs?: number
}

export function YouTubePlayer({
  videoId,
  lessonId,
  durationSecs,
  initialWatchedSecs = 0,
}: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
      if (!player) return
      if (player.getPlayerState() !== YT.PlayerState.PLAYING) return

      const watchedSecs = Math.floor(player.getCurrentTime())
      const totalDuration = player.getDuration() || durationSecs
      const completed = totalDuration > 0 && watchedSecs >= totalDuration * 0.95

      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchedSecs, completed }),
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [lessonId, durationSecs])

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
