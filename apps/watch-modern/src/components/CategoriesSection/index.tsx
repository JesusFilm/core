'use client'

import {
  BookOpen,
  Shield,
  Plus,
  HandHeart,
  Mountain,
  Compass,
  Heart,
  Sprout,
  Zap,
  RotateCcw,
  Scale,
  Send
} from 'lucide-react'
import type { KeyboardEvent, ReactElement } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

type CategoryItem = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  gradient: string
}

export interface CategoriesSectionProps {
  isLoading?: boolean
}

const categories: CategoryItem[] = [
  {
    id: 'jesus-life-teachings',
    title: "Jesus' Life & Teachings",
    icon: BookOpen,
    iconColor: 'text-amber-400',
    gradient: 'from-orange-600 via-amber-500 to-yellow-400'
  },
  {
    id: 'faith-salvation',
    title: 'Faith & Salvation',
    icon: Shield,
    iconColor: 'text-emerald-400',
    gradient: 'from-teal-600 via-emerald-500 to-green-400'
  },
  {
    id: 'hope-healing',
    title: 'Hope & Healing',
    icon: Plus,
    iconColor: 'text-pink-400',
    gradient: 'from-orange-700 via-red-500 to-pink-400'
  },
  {
    id: 'forgiveness-grace',
    title: 'Forgiveness & Grace',
    icon: HandHeart,
    iconColor: 'text-emerald-400',
    gradient: 'from-green-700 via-green-600 to-emerald-500'
  },
  {
    id: 'suffering-struggle',
    title: 'Suffering & Struggle',
    icon: Mountain,
    iconColor: 'text-purple-400',
    gradient: 'from-purple-700 via-purple-600 to-purple-500'
  },
  {
    id: 'identity-purpose',
    title: 'Identity & Purpose',
    icon: Compass,
    iconColor: 'text-blue-400',
    gradient: 'from-blue-700 via-blue-600 to-blue-500'
  },
  {
    id: 'love-relationships',
    title: 'Love & Relationships',
    icon: Heart,
    iconColor: 'text-rose-400',
    gradient: 'from-pink-700 via-pink-600 to-rose-500'
  },
  {
    id: 'prayer-spiritual-growth',
    title: 'Prayer & Spiritual Growth',
    icon: Sprout,
    iconColor: 'text-purple-400',
    gradient: 'from-indigo-700 via-indigo-600 to-purple-500'
  },
  {
    id: 'miracles-power-god',
    title: 'Miracles & Power of God',
    icon: Zap,
    iconColor: 'text-orange-400',
    gradient: 'from-yellow-600 via-orange-500 to-red-500'
  },
  {
    id: 'death-resurrection',
    title: 'Death & Resurrection',
    icon: RotateCcw,
    iconColor: 'text-gray-300',
    gradient: 'from-slate-700 via-slate-600 to-gray-500'
  },
  {
    id: 'justice-compassion',
    title: 'Justice & Compassion',
    icon: Scale,
    iconColor: 'text-cyan-400',
    gradient: 'from-emerald-700 via-teal-600 to-cyan-500'
  },
  {
    id: 'discipleship-mission',
    title: 'Discipleship & Mission',
    icon: Send,
    iconColor: 'text-indigo-400',
    gradient: 'from-violet-700 via-purple-600 to-indigo-500'
  }
]

export function CategoriesSection(props: CategoriesSectionProps): ReactElement {
  const { isLoading = false } = props

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
  }

  const sectionTitle = 'BROWSE BY CATEGORY'
  const headingText = 'Discover Content by Topic'

  return (
    <section className="min-h-screen bg-stone-950 py-16 text-white relative">
      {/* Background Image */}
      <div
        className="absolute left-0 right-0 top-0 w-full aspect-[32/15] opacity-20"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1583525957866-ea1cdcb4f46a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          mask: 'linear-gradient(to bottom, white 0%, white 50%, transparent 100%)',
          WebkitMask:
            'linear-gradient(to bottom, white 0%, white 50%, transparent 100%)'
        }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-stone-950/80 via-stone-900/50 to-stone-800/20" />
      {/* Texture Overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Header Section */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-12 relative z-10">
        <div className="flex justify-between items-start mb-12">
          <div className="max-w-6xl">
            <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-8 font-medium text-[rgba(255,255,255,0.6)]">
              {sectionTitle}
            </p>
            <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-[0.95] tracking-tight text-white mb-6">
              {headingText}
            </h2>
            <p className="hidden sm:block text-stone-100/90 text-xl leading-relaxed max-w-3xl text-[rgba(255,255,255,0.9)]">
              Explore biblical themes and topics that matter to you. Find films and videos organized by spiritual categories to deepen your understanding and faith journey.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Carousel */}
      <div className="relative z-10 mb-12">
        <div className="categories-carousel" style={{ paddingBottom: '80px' }}>
          <Carousel opts={{ align: 'start', loop: false }} className="w-full">
            <CarouselContent className="-ml-6 pl-6">
              {isLoading
                ? Array.from({ length: 12 }).map((_, index) => (
                    <CarouselItem key={`skeleton-${index}`} className={`basis-auto ${index === 0 ? 'pl-24' : 'pl-6'}`}>
                      <div className="w-[180px]">
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden p-4 border border-white/10 bg-white/5 animate-pulse">
                          <div className="h-10 w-10 bg-white/20 rounded mb-4" data-testid="category-loading-skeleton" />
                          <div className="h-4 w-3/4 bg-white/20 rounded" data-testid="category-loading-skeleton" />
                        </div>
                      </div>
                    </CarouselItem>
                  ))
                : categories.map((category, index) => {
                    const IconComponent = category.icon
                    return (
                      <CarouselItem key={category.id} className={`basis-auto ${index === 0 ? 'pl-24' : 'pl-6'}`}>
                        <div className="w-[180px]">
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label={`Browse ${category.title} category`}
                            onKeyDown={handleKeyDown}
                            className={`relative aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br ${category.gradient} hover:scale-105`}
                          >
                            <div
                              className="absolute inset-0 opacity-30"
                              style={{
                                backgroundImage:
                                  'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                            <div className="absolute top-4 right-4">
                              <IconComponent className={`w-12 h-12 ${category.iconColor}`} />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white text-lg xl:text-xl 2xl:text-2xl font-semibold tracking-wide leading-tight">
                                {category.title}
                              </h3>
                            </div>
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </div>
                      </CarouselItem>
                    )
                  })}
            </CarouselContent>
            <CarouselPrevious className="left-2 w-14 h-14 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white shadow-2xl" />
            <CarouselNext className="right-2 w-14 h-14 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white shadow-2xl" />
          </Carousel>
        </div>
      </div>
    </section>
  )
}
