import { ReactElement } from 'react'

import { cn } from '../../libs/cn'

export interface SharingIdeasWallProps {
  ideas: string[]
  className?: string
}

const gradientPalette = [
  'from-[#F97316] via-[#F59E0B] to-[#FACC15]',
  'from-[#2563EB] via-[#7C3AED] to-[#EC4899]',
  'from-[#0EA5E9] via-[#22D3EE] to-[#34D399]',
  'from-[#F87171] via-[#FB7185] to-[#FBBF24]',
  'from-[#8B5CF6] via-[#6366F1] to-[#22D3EE]'
]

function getGradientClass(index: number): string {
  return gradientPalette[index % gradientPalette.length]
}

export function SharingIdeasWall({
  ideas,
  className
}: SharingIdeasWallProps): ReactElement {
  if (ideas.length === 0) return <></>

  return (
    <div
      className={cn(
        'columns-1 gap-4 sm:columns-2 sm:gap-5 xl:columns-3',
        className
      )}
      data-testid="SharingIdeasWall"
    >
      {ideas.map((idea, index) => (
        <div key={`${index}-${idea.slice(0, 12)}`} className="mb-4 break-inside-avoid">
          <div
            className={cn(
              'flex min-h-[8rem] flex-col rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg shadow-black/20 ring-1 ring-white/10 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-2xl',
              getGradientClass(index)
            )}
            data-testid="SharingIdeasWallCard"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              #{index + 1}
            </span>
            <p className="mt-3 text-sm leading-6 text-white/95 sm:text-base">
              {idea}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
