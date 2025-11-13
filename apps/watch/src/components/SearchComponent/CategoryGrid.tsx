import { useTranslation } from 'next-i18next'
import { ReactElement, SVGProps } from 'react'

import Bible from '@core/shared/ui/icons/Bible'
import Book from '@core/shared/ui/icons/Book'
import Calendar1 from '@core/shared/ui/icons/Calendar1'
import Play1 from '@core/shared/ui/icons/Play1'
import Star2 from '@core/shared/ui/icons/Star2'
import VideoOn from '@core/shared/ui/icons/VideoOn'

interface CategoryItem {
  title: string
  icon: React.ComponentType<SVGProps<SVGSVGElement>>
  gradient: string
  searchTerm: string
}

export interface CategoryGridProps {
  onCategorySelect: (searchTerm: string) => void
}

export function CategoryGrid({
  onCategorySelect
}: CategoryGridProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const categories: CategoryItem[] = [
    {
      title: t('Bible Stories'),
      icon: Bible,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      searchTerm: 'bible stories'
    },
    {
      title: t('Worship'),
      icon: Star2,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      searchTerm: 'worship'
    },
    {
      title: t('Teaching'),
      icon: Book,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      searchTerm: 'teaching'
    },
    {
      title: t('Youth'),
      icon: Play1,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      searchTerm: 'youth'
    },
    {
      title: t('Family'),
      icon: VideoOn,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      searchTerm: 'family'
    },
    {
      title: t('Holiday'),
      icon: Calendar1,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      searchTerm: 'holiday'
    }
  ]

  return (
    <div>
      <div className="mb-3 block text-sm font-semibold tracking-wider text-stone-600 uppercase">
        {t('Browse Categories')}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {categories.map((category, index) => {
          const IconComponent = category.icon

          return (
            <div key={index}>
              <button
                onClick={() => onCategorySelect(category.searchTerm)}
                className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg p-6 text-white transition-transform duration-200 text-shadow-sm hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                style={{
                  background: category.gradient,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                <div className="pointer-events-none absolute inset-0 flex items-start justify-end">
                  <IconComponent
                    className="h-12 w-12 opacity-20 mix-blend-overlay drop-shadow-lg"
                    style={{
                      transform: 'scale(5)',
                      transformOrigin: 'top right'
                    }}
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[url(/assets/overlay.svg)] bg-repeat opacity-70 mix-blend-multiply"></div>
                <div
                  className="absolute bottom-3 left-3 text-3xl leading-tight font-extrabold"
                  style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    lineHeight: 1.2
                  }}
                >
                  {category.title}
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
