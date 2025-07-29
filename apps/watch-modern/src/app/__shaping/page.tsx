'use client'

import { MOCK_COLLECTIONS } from '../../shaping/data/mockVideos';
import { HERO_CONTENT, LANGUAGES } from '../../shaping/data/collections';

export default function ShapingHomepage() {
  const currentLang = 'en'; // For now, defaulting to English
  const heroContent = HERO_CONTENT[currentLang];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">JesusFilm</h1>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">Watch</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Discover</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
            </nav>
            
            {/* Language Switcher */}
            <div className="flex items-center space-x-4">
              <select className="rounded border border-gray-300 bg-white px-3 py-1 text-sm">
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <a 
                href="/videos/search" 
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                All Videos
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {heroContent.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
              {heroContent.subtitle}
            </p>
            <div className="mt-10">
              <button className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-blue-600 shadow-lg hover:bg-gray-50">
                {heroContent.ctaText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {MOCK_COLLECTIONS.map((collection) => (
          <section key={collection.id} className="mb-16">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">{collection.title}</h2>
              <p className="mt-2 text-gray-600">{collection.description}</p>
            </div>
            
            {/* Video Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collection.videos.map((video) => (
                <div key={video.id} className="group cursor-pointer transition-transform hover:scale-105">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <div className="text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-white/80 flex items-center justify-center mb-2">
                          <svg className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                          </svg>
                        </div>
                        <p className="text-xs text-gray-500">Video Thumbnail</p>
                      </div>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="mt-3 space-y-1">
                    <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                      {video.title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-gray-600">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="capitalize">{video.category}</span>
                      <span>{new Date(video.publishedAt).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
} 