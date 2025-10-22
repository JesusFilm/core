'use client'

import { memo, useEffect, useState } from 'react'

import { categorySharingOptions } from '../../config/new-page'

type RotatingTextProps = {
  onCategoryChange: (category: string) => void
  hoveredCategory: string | null
  isHovering: boolean
  isAnimationStopped: boolean
}

const rotatingItems = [
  { text: 'in a text with your friends', category: 'Conversations', colorClass: 'text-cyan-600' },
  { text: 'on your Instagram stories', category: 'Social Media', colorClass: 'text-pink-500' },
  { text: "on your church's website", category: 'Website', colorClass: 'text-orange-500' },
  { text: 'in a printed church bulletin', category: 'Print', colorClass: 'text-emerald-600' },
  { text: 'in a sermon at your church', category: 'Real Life', colorClass: 'text-rose-500' },
  { text: 'in a group chat with your family', category: 'Conversations', colorClass: 'text-cyan-600' },
  { text: "in your church's Facebook group", category: 'Social Media', colorClass: 'text-pink-500' },
  { text: 'in your ministry blog post', category: 'Website', colorClass: 'text-orange-500' },
  { text: 'on a flyer for your community event', category: 'Print', colorClass: 'text-emerald-600' },
  { text: 'in a small group Bible study', category: 'Real Life', colorClass: 'text-rose-500' },
  { text: 'in a prayer group on WhatsApp', category: 'Conversations', colorClass: 'text-cyan-600' },
  { text: 'in your Twitter/X post', category: 'Social Media', colorClass: 'text-pink-500' },
  { text: 'in your online testimony page', category: 'Website', colorClass: 'text-orange-500' },
  { text: 'in your devotional journal', category: 'Print', colorClass: 'text-emerald-600' },
  { text: 'in a conversation with a neighbor', category: 'Real Life', colorClass: 'text-rose-500' },
  { text: 'in YouTube comments', category: 'Conversations', colorClass: 'text-cyan-600' },
  { text: 'on your TikTok feed', category: 'Social Media', colorClass: 'text-pink-500' },
  { text: 'in your podcast website', category: 'Website', colorClass: 'text-orange-500' },
  { text: 'on a Bible study handout', category: 'Print', colorClass: 'text-emerald-600' },
  { text: 'during a conference or retreat', category: 'Real Life', colorClass: 'text-rose-500' },
  { text: 'in a private message to someone in need', category: 'Conversations', colorClass: 'text-cyan-600' },
  { text: 'with your colleagues on LinkedIn', category: 'Social Media', colorClass: 'text-pink-500' },
  { text: 'on your nonprofit homepage', category: 'Website', colorClass: 'text-orange-500' },
  { text: 'in your published book/article', category: 'Print', colorClass: 'text-emerald-600' },
  { text: 'at a youth group meeting', category: 'Real Life', colorClass: 'text-rose-500' }
]

const categoryColors: Record<string, string> = {
  Conversations: 'text-cyan-600',
  'Social Media': 'text-pink-500',
  Website: 'text-orange-500',
  Print: 'text-emerald-600',
  'Real Life': 'text-rose-500'
}

export const RotatingText = memo(
  ({
    hoveredCategory,
    isAnimationStopped,
    isHovering,
    onCategoryChange
  }: RotatingTextProps) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentTextIndex, setCurrentTextIndex] = useState(0)

    useEffect(() => {
      if (!isHovering && !isAnimationStopped) {
        const interval = setInterval(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % rotatingItems.length)
        }, 3000)

        return () => clearInterval(interval)
      }
    }, [isHovering, isAnimationStopped])

    useEffect(() => {
      if (!isHovering && !isAnimationStopped) {
        onCategoryChange(rotatingItems[currentIndex].category)
      }
    }, [currentIndex, onCategoryChange, isHovering, isAnimationStopped])

    useEffect(() => {
      if (isHovering && hoveredCategory) {
        const categoryOptions = categorySharingOptions[hoveredCategory] || []
        if (categoryOptions.length > 0) {
          const interval = setInterval(() => {
            setCurrentTextIndex(
              (prevIndex) => (prevIndex + 1) % categoryOptions.length
            )
          }, 2000)

          return () => clearInterval(interval)
        }
      }
    }, [isHovering, hoveredCategory])

    const getCurrentText = () => {
      if (isHovering && hoveredCategory) {
        const categoryOptions = categorySharingOptions[hoveredCategory] || []
        return (
          categoryOptions[currentTextIndex] || `with ${hoveredCategory.toLowerCase()}`
        )
      }
      return rotatingItems[currentIndex]?.text || ''
    }

    const getCurrentColorClass = () => {
      if (isHovering && hoveredCategory) {
        return categoryColors[hoveredCategory] || 'text-cyan-600'
      }
      return rotatingItems[currentIndex]?.colorClass || 'text-cyan-600'
    }

    return (
      <span
        className={`inline-block animate-text-rotate font-semibold ${getCurrentColorClass()}`}
        data-highlight-category={
          isHovering && hoveredCategory
            ? hoveredCategory
            : rotatingItems[currentIndex]?.category
        }
      >
        {getCurrentText()}
      </span>
    )
  }
)

RotatingText.displayName = 'RotatingText'
