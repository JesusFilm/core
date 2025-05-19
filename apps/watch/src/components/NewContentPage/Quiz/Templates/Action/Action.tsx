import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'

import { useQuiz } from '../../QuizProvider'

export interface ActionMetadata {
  id: string
  label: string
  imageUrl?: string
  tags: string[]
  next: string | null
}

interface ActionButtonProps extends ActionMetadata {
  idx: number
  onHover: (idx: number | null) => void
}

export const Action = ({
  idx,
  label,
  imageUrl,
  tags,
  next,
  onHover
}: ActionButtonProps) => {
  const { t } = useTranslation()
  const { addTags, goTo } = useQuiz()

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        addTags(tags)
        if (next) {
          goTo(next)
        }
      }
    },
    [idx, next, addTags, goTo]
  )

  const handleClick = () => {
    addTags(tags)
    if (next) {
      goTo(next)
    }
  }

  return (
    <div
      role="option"
      className={`group animate-fade-in-delay-${2000 + idx * 500} flex items-end justify-center w-80 h-80 rounded-2xl shadow-lg transition-all duration-150 text-xl font-bold relative overflow-hidden hover:scale-105 hover:shadow-2xl hover:outline hover:outline-3 hover:outline-white focus:scale-105 focus:shadow-2xl focus:outline focus:outline-3 focus:outline-white cursor-pointer`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHover(idx)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(idx)}
      onBlur={() => onHover(null)}
      tabIndex={0}
      aria-label={t(label)}
    >
      <div
        role="presentation"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <span className="relative z-10 text-center p-4 text-white">
        {t(label)}
      </span>
    </div>
  )
}
