import { memo, useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'

import { categorySharingOptions } from '../../config/new-page'

export type RotatingTextProps = {
  onCategoryChange: (category: string) => void
  hoveredCategory: string | null
  isHovering: boolean
  isAnimationStopped: boolean
}

const rotatingItems = [
  // Conversations - Blue gradient
  {
    text: 'in a text with your friends',
    category: 'Conversations',
    colorClass: 'text-cyan-600'
  },
  {
    text: 'on your Instagram stories',
    category: 'Social Media',
    colorClass: 'text-pink-500'
  },
  {
    text: "on your church's website",
    category: 'Website',
    colorClass: 'text-orange-500'
  },
  {
    text: 'in a printed church bulletin',
    category: 'Print',
    colorClass: 'text-emerald-600'
  },
  {
    text: 'in a sermon at your church',
    category: 'Real Life',
    colorClass: 'text-rose-500'
  },

  // Social Media - Purple/Pink/Red gradient
  {
    text: 'in a group chat with your family',
    category: 'Conversations',
    colorClass: 'text-cyan-600'
  },
  {
    text: "in your church's Facebook group",
    category: 'Social Media',
    colorClass: 'text-pink-500'
  },
  {
    text: 'in your ministry blog post',
    category: 'Website',
    colorClass: 'text-orange-500'
  },
  {
    text: 'on a flyer for your community event',
    category: 'Print',
    colorClass: 'text-emerald-600'
  },
  {
    text: 'in a small group Bible study',
    category: 'Real Life',
    colorClass: 'text-rose-500'
  },

  // Website - Orange/Yellow/Amber gradient
  {
    text: 'in a prayer group on WhatsApp',
    category: 'Conversations',
    colorClass: 'text-cyan-600'
  },
  {
    text: 'in your Twitter/X post',
    category: 'Social Media',
    colorClass: 'text-pink-500'
  },
  {
    text: 'in your online testimony page',
    category: 'Website',
    colorClass: 'text-orange-500'
  },
  {
    text: 'in your devotional journal',
    category: 'Print',
    colorClass: 'text-emerald-600'
  },
  {
    text: 'in a conversation with a neighbor',
    category: 'Real Life',
    colorClass: 'text-rose-500'
  },

  // Print - Emerald/Green/Lime gradient
  {
    text: 'in YouTube comments',
    category: 'Conversations',
    colorClass: 'text-cyan-600'
  },
  {
    text: 'on your TikTok feed',
    category: 'Social Media',
    colorClass: 'text-pink-500'
  },
  {
    text: 'in your podcast website',
    category: 'Website',
    colorClass: 'text-orange-500'
  },
  {
    text: 'on a Bible study handout',
    category: 'Print',
    colorClass: 'text-emerald-600'
  },
  {
    text: 'during a conference or retreat',
    category: 'Real Life',
    colorClass: 'text-rose-500'
  },

  // Real Life - Rose/Pink/Fuchsia gradient
  {
    text: 'in a private message',
    category: 'Conversations',
    colorClass: 'text-cyan-600'
  },
  {
    text: 'with your colleagues on LinkedIn',
    category: 'Social Media',
    colorClass: 'text-pink-500'
  },
  {
    text: 'on your nonprofit homepage',
    category: 'Website',
    colorClass: 'text-orange-500'
  },
  {
    text: 'in your published book/article',
    category: 'Print',
    colorClass: 'text-emerald-600'
  },
  {
    text: 'at a youth group meeting',
    category: 'Real Life',
    colorClass: 'text-rose-500'
  }
] as const

const categoryColors = {
  Conversations: 'text-cyan-600',
  'Social Media': 'text-pink-500',
  Website: 'text-orange-500',
  Print: 'text-emerald-600',
  'Real Life': 'text-rose-500'
} as const

const RotatingTextComponent = ({
  onCategoryChange,
  hoveredCategory,
  isHovering,
  isAnimationStopped
}: RotatingTextProps): ReactElement => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  const currentItem = rotatingItems[currentIndex]

  useEffect(() => {
    if (!isHovering && !isAnimationStopped) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % rotatingItems.length)
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isHovering, isAnimationStopped])

  useEffect(() => {
    if (!isHovering && !isAnimationStopped && currentItem) {
      onCategoryChange(currentItem.category)
    }
  }, [currentItem, isHovering, isAnimationStopped, onCategoryChange])

  const hoveredCategoryOptions = useMemo(() => {
    if (!hoveredCategory) {
      return []
    }

    return categorySharingOptions[hoveredCategory] ?? []
  }, [hoveredCategory])

  useEffect(() => {
    if (isHovering && hoveredCategoryOptions.length > 0) {
      const interval = setInterval(() => {
        setCurrentTextIndex(
          (prevIndex) => (prevIndex + 1) % hoveredCategoryOptions.length
        )
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [hoveredCategoryOptions.length, isHovering])

  const displayText = useMemo(() => {
    if (isHovering && hoveredCategory) {
      const fallbackText = `with ${hoveredCategory.toLowerCase()}`
      return hoveredCategoryOptions[currentTextIndex] ?? fallbackText
    }
    return currentItem?.text ?? ''
  }, [
    currentItem,
    currentTextIndex,
    hoveredCategory,
    hoveredCategoryOptions,
    isHovering
  ])

  const colorClass = useMemo(() => {
    if (isHovering && hoveredCategory) {
      return categoryColors[hoveredCategory] ?? 'text-cyan-600'
    }
    return currentItem?.colorClass ?? 'text-cyan-600'
  }, [currentItem, hoveredCategory, isHovering])

  const category =
    isHovering && hoveredCategory ? hoveredCategory : currentItem?.category

  return (
    <span
      className={`inline-block animate-text-rotate font-semibold text-[80%] md:text-[100%] ${colorClass}`}
      data-highlight-category={category}
    >
      {displayText}
    </span>
  )
}

export const RotatingText = memo(RotatingTextComponent)
