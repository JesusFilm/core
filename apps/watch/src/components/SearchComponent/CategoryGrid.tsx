import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Bible from '@core/shared/ui/icons/Bible'
import Book from '@core/shared/ui/icons/Book'
import Calendar1 from '@core/shared/ui/icons/Calendar1'
import Play1 from '@core/shared/ui/icons/Play1'
import Star2 from '@core/shared/ui/icons/Star2'
import VideoOn from '@core/shared/ui/icons/VideoOn'

interface CategoryItem {
  title: string
  icon: React.ComponentType<any>
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
      <div className="block mb-3 font-semibold text-xs uppercase tracking-wider text-gray-600">
        {t('Browse Categories')}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category, index) => {
          const IconComponent = category.icon

          return (
            <div key={index}>
              <button
                onClick={() => onCategorySelect(category.searchTerm)}
                className="w-full aspect-video p-6 rounded-lg flex flex-col items-center justify-center gap-4 relative overflow-hidden text-white text-shadow-sm hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{
                  background: category.gradient,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                <IconComponent
                  className="w-12 h-12 drop-shadow-lg"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                />
                <div
                  className="text-lg font-semibold text-center leading-tight"
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
