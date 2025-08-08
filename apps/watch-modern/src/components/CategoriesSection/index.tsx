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
  Send,
} from 'lucide-react'
import type { KeyboardEvent, ReactElement } from 'react'

type CategoryItem = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
}

export interface CategoriesSectionProps {
  isLoading?: boolean
}

const hardcodedCategories: CategoryItem[] = [
  {
    id: 'jesus-life-teachings',
    title: "Jesus' Life & Teachings",
    icon: BookOpen,
    iconColor: 'text-amber-400'
  },
  {
    id: 'faith-salvation',
    title: 'Faith & Salvation',
    icon: Shield,
    iconColor: 'text-emerald-400'
  },
  {
    id: 'hope-healing',
    title: 'Hope & Healing',
    icon: Plus,
    iconColor: 'text-pink-400'
  },
  {
    id: 'forgiveness-grace',
    title: 'Forgiveness & Grace',
    icon: HandHeart,
    iconColor: 'text-emerald-400'
  },
  {
    id: 'suffering-struggle',
    title: 'Suffering & Struggle',
    icon: Mountain,
    iconColor: 'text-purple-400'
  },
  {
    id: 'identity-purpose',
    title: 'Identity & Purpose',
    icon: Compass,
    iconColor: 'text-blue-400'
  },
  {
    id: 'love-relationships',
    title: 'Love & Relationships',
    icon: Heart,
    iconColor: 'text-rose-400'
  },
  {
    id: 'prayer-spiritual-growth',
    title: 'Prayer & Spiritual Growth',
    icon: Sprout,
    iconColor: 'text-purple-400'
  },
  {
    id: 'miracles-power-god',
    title: 'Miracles & Power of God',
    icon: Zap,
    iconColor: 'text-orange-400'
  },
  {
    id: 'death-resurrection',
    title: 'Death & Resurrection',
    icon: RotateCcw,
    iconColor: 'text-gray-300'
  },
  {
    id: 'justice-compassion',
    title: 'Justice & Compassion',
    icon: Scale,
    iconColor: 'text-cyan-400'
  },
  {
    id: 'discipleship-mission',
    title: 'Discipleship & Mission',
    icon: Send,
    iconColor: 'text-indigo-400'
  }
]

export function CategoriesSection(props: CategoriesSectionProps): ReactElement {
  const { isLoading = false } = props

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }
    event.preventDefault()
    // No navigation in Basic slice; reserved for future improvements
  }

  const sectionTitle = 'BIBLICAL CATEGORIES'
  const headingText = 'Explore by Theme'

  return (
    <section className="min-h-[60vh] bg-slate-950 py-16 text-white relative">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-8 relative z-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-4">{sectionTitle}</p>
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold leading-tight text-white">
              {headingText}
            </h2>
          </div>
          <button
            type="button"
            aria-label="see all categories"
            className="justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 rounded-full font-semibold tracking-wide transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/20 text-white hidden sm:inline-flex"
          >
            SEE ALL
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 12 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse">
                  <div className="h-8 w-8 bg-white/20 rounded mb-3" data-testid="category-loading-skeleton" />
                  <div className="h-4 w-full bg-white/20 rounded" data-testid="category-loading-skeleton" />
                </div>
              ))
            : hardcodedCategories.map((category) => {
                const IconComponent = category.icon
                return (
                  <div
                    key={category.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Browse ${category.title} category`}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 hover:bg-white/10 transition-colors duration-200"
                    onKeyDown={handleKeyDown}
                  >
                    <div className="flex flex-col items-center text-center">
                      <IconComponent className={`w-8 h-8 ${category.iconColor} mb-3`} />
                      <h3 className="text-white text-sm font-semibold leading-snug">{category.title}</h3>
                    </div>
                  </div>
                )
              })}
        </div>

        <div className="mt-6 sm:hidden">
          <button
            type="button"
            aria-label="see all categories"
            className="w-full justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 rounded-full font-semibold tracking-wide transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          >
            SEE ALL
          </button>
        </div>
      </div>
    </section>
  )
}
