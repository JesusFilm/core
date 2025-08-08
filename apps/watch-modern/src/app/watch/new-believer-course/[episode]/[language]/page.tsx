import type { ReactElement } from 'react'

interface VideoPageProps {
  params: {
    episode: string
    language: string
  }
}

export default function VideoPage({ params }: VideoPageProps): ReactElement {
  const { episode, language } = params

  // Extract episode number and title from the episode parameter
  const episodeMatch = episode.match(/^(\d+)-(.+)$/)
  const episodeNum = episodeMatch ? episodeMatch[1] : '1'
  const episodeTitle = episodeMatch ? episodeMatch[2].replace(/-/g, ' ') : 'episode'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-8">
        <div className="mb-8">
          <a 
            href="/watch" 
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Episode {episodeNum}: {episodeTitle}
          </h1>
          <p className="text-lg text-gray-300 mb-4">
            Language: {language}
          </p>
          <p className="text-lg text-gray-300">
            Video player coming soon...
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Navigation working! This is a placeholder page.
          </p>
        </div>
      </div>
    </div>
  )
}
