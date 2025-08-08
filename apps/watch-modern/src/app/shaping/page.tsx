'use client'

import { MOCK_COLLECTIONS } from '../../shaping/data/mockVideos';
import { HERO_CONTENT } from '../../shaping/data/collections';
import { Globe } from 'lucide-react';
import { VideoCarousel } from '../../shaping/components/carousel/VideoCarousel';
import VideoCard from '../../shaping/components/cards/VideoCard';


export default function ShapingHomepage() {
  const currentLang = 'en'; // For now, defaulting to English
  const heroContent = HERO_CONTENT[currentLang];

  return (
    <div className="min-h-screen bg-[#131111] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="mx-auto max-w-[1920px] w-full padded">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <svg width="49" height="36" viewBox="0 0 49 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M45.854 -0.000301361H2.34C1.048 -0.000301361 0 1.0467 0 2.3397V20.2427C0 21.2917 0.699 22.2137 1.709 22.4957L47.072 35.2077C47.636 35.3657 48.194 34.9417 48.194 34.3567V2.3397C48.194 1.0467 47.147 -0.000301361 45.854 -0.000301361Z" fill="#EF3340"/>
              </svg>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center">
              <button className="flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm p-2 text-stone-300 hover:bg-white/20 transition-colors">
                <Globe className="h-5 w-5 text-stone-300 drop-shadow-[0_0_8px_rgba(168,162,158,0.6)]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#ee3441] to-[#d62e3a] pt-36 pb-20">
        <div className="mx-auto max-w-[1920px] w-full padded">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {heroContent.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-red-100">
              {heroContent.subtitle}
            </p>
            <div className="mt-10">
              <button className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-[#ee3441] shadow-lg hover:bg-gray-50">
                {heroContent.ctaText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <main className="mx-auto max-w-[1920px] w-full padded py-16">
        {/* Featured Carousel */}
        <VideoCarousel
          title="Featured Videos"
          description="Our most popular and impactful content"
          videos={MOCK_COLLECTIONS.find(c => c.id === 'col_featured_001')?.videos || []}
        />

        {/* Regular Grid Sections */}
        {MOCK_COLLECTIONS.map((collection) => (
          <section key={collection.id} className="mb-16">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white">{collection.title}</h2>
              <p className="mt-2 text-stone-200/80">{collection.description}</p>
            </div>
            
            {/* Video Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collection.videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
} 