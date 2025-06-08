import type { Meta, StoryObj } from '@storybook/react'

import { BibleQuote } from './BibleQuote'

const meta: Meta<typeof BibleQuote> = {
  title: 'Components/BibleQuote',
  component: BibleQuote,
  parameters: {
    layout: 'centered'
  }
}

export default meta
type Story = StoryObj<typeof BibleQuote>

export const Default: Story = {
  args: {
    children: (
      <>
        <p className="text-base leading-relaxed">
          In the beginning God created the heavens and the earth.
        </p>
        <p className="text-sm text-gray-600">Genesis 1:1</p>
      </>
    ),
    imageUrl: '/path/to/image.jpg',
    bgColor: '#ffffff'
  }
}

export const LongQuote: Story = {
  args: {
    children: (
      <>
        <p className="text-base leading-relaxed">
          Your word is a lamp to my feet and a light to my path. I have sworn an
          oath and confirmed it, to keep your righteous rules. I am severely
          afflicted; give me life, O Lord, according to your word! Accept my
          freewill offerings of praise, O Lord, and teach me your rules. I hold
          my life in my hand continually, but I do not forget your law. The
          wicked have laid a snare for me, but I do not stray from your
          precepts. Your testimonies are my heritage forever, for they are the
          joy of my heart. I incline my heart to perform your statutes forever,
          to the end.
        </p>
        <p className="text-sm text-gray-600">Psalm 119:105-112</p>
      </>
    ),
    imageUrl: '/path/to/image.jpg',
    bgColor: '#ffffff'
  }
}
