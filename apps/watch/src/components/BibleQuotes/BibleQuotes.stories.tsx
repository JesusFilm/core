import type { Meta, StoryObj } from '@storybook/react'

import { BibleQuotes } from './BibleQuotes'

const meta: Meta<typeof BibleQuotes> = {
  title: 'Components/BibleQuotes',
  component: BibleQuotes,
  parameters: {
    layout: 'centered'
  }
}

export default meta
type Story = StoryObj<typeof BibleQuotes>

const mockCitations = [
  {
    id: '1',
    videoId: 'video1',
    osisId: 'Genesis 1:1',
    bibleBookId: 'Genesis',
    order: 1,
    chapterStart: 1,
    chapterEnd: 1,
    verseStart: 1,
    verseEnd: 1
  },
  {
    id: '2',
    videoId: 'video1',
    osisId: 'John 3:16',
    bibleBookId: 'John',
    order: 2,
    chapterStart: 3,
    chapterEnd: 3,
    verseStart: 16,
    verseEnd: 16
  }
]

export const Default: Story = {
  args: {
    contentId: '123',
    bibleCitations: mockCitations,
    bibleQuotesTitle: 'Bible Quotes',
    shareButtonText: 'Share',
    shareDataTitle: 'Share this content'
  }
}

export const Empty: Story = {
  args: {
    contentId: '123',
    bibleCitations: [],
    bibleQuotesTitle: 'Bible Quotes',
    shareButtonText: 'Share',
    shareDataTitle: 'Share this content'
  }
}
