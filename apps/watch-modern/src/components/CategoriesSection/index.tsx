'use client'

import {
  BookOpen,
  Compass,
  HandHeart,
  Heart,
  Mountain,
  Plus,
  RotateCcw,
  Scale,
  Send,
  Shield,
  Sprout,
  Zap,
} from 'lucide-react'
import type { KeyboardEvent, ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

type CategoryItem = {
  id: string
  title: string
  icon: any
  iconColor: string
  gradient: string
}

export interface CategoriesSectionProps {
  isLoading?: boolean
}

const SECTION_TITLE = 'BROWSE BY CATEGORY'
const HEADING_TEXT = 'Discover Content by Topic'
const DESCRIPTION_TEXT = 'Explore biblical themes and topics that matter to you. Find films and videos organized by spiritual categories to deepen your understanding and faith journey.'
const BUTTON_TEXT = 'SEE ALL'
const BOTTOM_DESCRIPTION_TEXT = 'Each category contains carefully curated films and videos that explore specific biblical themes and life applications. Whether you\'re seeking guidance, inspiration, or deeper understanding, these collections will guide your spiritual journey.'

const hardcodedCategories: CategoryItem[] = [
  {
    id: 'jesus-life-teachings',
    title: "Jesus' Life & Teachings",
    icon: BookOpen,
    iconColor: "text-amber-400",
    gradient: "from-orange-600 via-amber-500 to-yellow-400"
  },
  {
    id: 'faith-salvation',
    title: 'Faith & Salvation',
    icon: Shield,
    iconColor: "text-emerald-400",
    gradient: "from-teal-600 via-emerald-500 to-green-400"
  },
  {
    id: 'hope-healing',
    title: 'Hope & Healing',
    icon: Plus,
    iconColor: "text-pink-400",
    gradient: "from-orange-700 via-red-500 to-pink-400"
  },
  {
    id: 'forgiveness-grace',
    title: 'Forgiveness & Grace',
    icon: HandHeart,
    iconColor: "text-emerald-400",
    gradient: "from-green-700 via-green-600 to-emerald-500"
  },
  {
    id: 'suffering-struggle',
    title: 'Suffering & Struggle',
    icon: Mountain,
    iconColor: "text-purple-400",
    gradient: "from-purple-700 via-purple-600 to-purple-500"
  },
  {
    id: 'identity-purpose',
    title: 'Identity & Purpose',
    icon: Compass,
    iconColor: "text-blue-400",
    gradient: "from-blue-700 via-blue-600 to-blue-500"
  },
  {
    id: 'love-relationships',
    title: 'Love & Relationships',
    icon: Heart,
    iconColor: "text-rose-400",
    gradient: "from-pink-700 via-pink-600 to-rose-500"
  },
  {
    id: 'prayer-spiritual-growth',
    title: 'Prayer & Spiritual Growth',
    icon: Sprout,
    iconColor: "text-purple-400",
    gradient: "from-indigo-700 via-indigo-600 to-purple-500"
  },
  {
    id: 'miracles-power-of-god',
    title: 'Miracles & Power of God',
    icon: Zap,
    iconColor: "text-orange-400",
    gradient: "from-yellow-600 via-orange-500 to-red-500"
  },
  {
    id: 'death-resurrection',
    title: 'Death & Resurrection',
    icon: RotateCcw,
    iconColor: "text-gray-300",
    gradient: "from-slate-700 via-slate-600 to-gray-500"
  },
  {
    id: 'justice-compassion',
    title: 'Justice & Compassion',
    icon: Scale,
    iconColor: "text-cyan-400",
    gradient: "from-emerald-700 via-teal-600 to-cyan-500"
  },
  {
    id: 'discipleship-mission',
    title: 'Discipleship & Mission',
    icon: Send,
    iconColor: "text-indigo-400",
    gradient: "from-violet-700 via-purple-600 to-indigo-500"
  }
]

export function CategoriesSection({ isLoading = false }: CategoriesSectionProps): ReactElement {
  const handleCategoryClick = (categoryId: string) => {
    // TODO: Navigate to category page
    console.log('Navigate to category:', categoryId)
  }

  const handleKeyDown = (event: KeyboardEvent, categoryId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCategoryClick(categoryId)
    }
  }

  if (isLoading) {
    return (
      <section className="min-h-screen bg-stone-950 py-16 scroll-snap-start-always text-white relative">
        {/* Background Image - Bottom Layer */}
        <div
          className="absolute left-0 right-0 top-0 w-full aspect-[32/15] opacity-20"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1583525957866-ea1cdcb4f46a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            mask: "linear-gradient(to bottom, white 0%, white 50%, transparent 100%)",
            WebkitMask:
              "linear-gradient(to bottom, white 0%, white 50%, transparent 100%)",
          }}
        />

        {/* Gradient Overlay - Middle Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-stone-950/80 via-stone-900/50 to-stone-800/20" />

        {/* Texture Overlay - Top Layer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Header Section - Constrained */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-12 relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div className="max-w-6xl">
              <div className="h-4 bg-stone-200/80 rounded mb-8 w-48 animate-pulse" />
              <div className="h-12 bg-white rounded mb-6 w-96 animate-pulse" />
              <div className="h-6 bg-stone-100/90 rounded mb-4 w-3xl animate-pulse" />
              <div className="h-6 bg-stone-100/90 rounded w-2xl animate-pulse" />
            </div>
            <div className="h-12 w-32 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        {/* Categories Carousel - Full Width */}
        <div className="relative z-10 mb-12">
          <div 
            className="categories-carousel"
            style={{
              paddingBottom: "80px",
            }}
          >
            <div className="w-full">
              <div className="-ml-6 pl-6 flex gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className={`w-[180px] ${index === 0 ? 'pl-24' : 'pl-6'}`}>
                    <div className="aspect-[4/5] rounded-2xl bg-stone-800 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description Text - Constrained */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 relative z-10 mb-12">
          <div className="h-6 bg-stone-200/80 rounded w-full animate-pulse" />
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-stone-950 py-16 scroll-snap-start-always text-white relative">
      {/* Background Image - Bottom Layer */}
      <div
        className="absolute left-0 right-0 top-0 w-full aspect-[32/15] opacity-20"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1583525957866-ea1cdcb4f46a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          mask: "linear-gradient(to bottom, white 0%, white 50%, transparent 100%)",
          WebkitMask:
            "linear-gradient(to bottom, white 0%, white 50%, transparent 100%)",
        }}
      />

      {/* Gradient Overlay - Middle Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-stone-950/80 via-stone-900/50 to-stone-800/20" />

      {/* Texture Overlay - Top Layer */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Header Section - Constrained */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-12 relative z-10">
        <div className="flex justify-between items-start mb-12">
          <div className="max-w-6xl">
            <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-8 font-medium text-[rgba(255,255,255,0.6)]">
              {SECTION_TITLE}
            </p>
            <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-[0.95] tracking-tight text-white mb-6">
              {HEADING_TEXT}
            </h2>
            <p className="text-stone-100/90 text-xl leading-relaxed max-w-3xl text-[rgba(255,255,255,0.9)]">
              {DESCRIPTION_TEXT}
            </p>
          </div>
          <Button
            size="lg"
            className="bg-white text-slate-900 hover:bg-blue-50 px-10 py-4 rounded-full font-semibold tracking-wide transition-all duration-200 flex items-center gap-3 mt-8 shadow-2xl hover:shadow-white/20"
          >
            {BUTTON_TEXT}
          </Button>
        </div>
      </div>

      {/* Categories Carousel - Full Width */}
      <div className="relative z-10 mb-12">
        <div 
          className="categories-carousel"
          style={{
            paddingBottom: "80px",
          }}
        >
          <Carousel 
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6 pl-6">
              {hardcodedCategories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <CarouselItem key={category.id} className={`basis-auto ${index === 0 ? 'pl-24' : 'pl-6'}`}>
                    <div className="w-[180px]">
                      <div 
                        className={`relative aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br ${category.gradient} hover:scale-105 slide-with-bevel`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Browse ${category.title} category`}
                        onClick={() => handleCategoryClick(category.id)}
                        onKeyDown={(event) => handleKeyDown(event, category.id)}
                      >
                        {/* Noise texture overlay */}
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{
                            backgroundImage:
                              'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        />
                        
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                        
                        {/* Solid colored icon */}
                        <div className="absolute top-4 right-4">
                          <IconComponent className={`w-12 h-12 ${category.iconColor}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white text-lg xl:text-xl 2xl:text-2xl font-semibold tracking-wide leading-tight">
                            {category.title}
                          </h3>
                        </div>

                        {/* Hover overlay */}
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

      {/* Description Text - Constrained */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 relative z-10 mb-12">
        <p className="text-lg xl:text-xl mt-4 leading-relaxed text-stone-200/80 text-[20px]">
          {BOTTOM_DESCRIPTION_TEXT}
        </p>
      </div>
    </section>
  )
}
