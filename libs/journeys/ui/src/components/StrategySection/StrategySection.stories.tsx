import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { StrategySection } from './StrategySection'

const StrategySectionStory: Meta<typeof StrategySection> = {
  ...journeysAdminConfig,
  component: StrategySection,
  title: 'Journeys-Admin/StrategySection'
}

const Template: StoryObj<typeof StrategySection> = {
  render: ({ ...args }) => (
    <StrategySection
      strategySlug={args.strategySlug}
      isError={args.isError}
      variant={args.variant}
    />
  )
}

export const Canva = {
  ...Template,
  args: {
    strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view',
    variant: 'full'
  }
}

export const CanvaMovie = {
  ...Template,
  args: {
    strategySlug: 'https://www.canva.com/design/DAFvCrg6dMw/watch',
    variant: 'full'
  }
}

export const GoogleSlides = {
  ...Template,
  args: {
    strategySlug:
      'https://docs.google.com/presentation/d/e/2PACX-1vRjI5K0O2Zsx7aVlqHnGre23faBzTQNcYRNVhstdpv8z3vLyUQ3ile3PVZj72Mk7S4pMtm5S1P8oHpY/pub?start=false&loop=false&delayms=3000',
    variant: 'full'
  }
}

export const PlaceHolderDefault = {
  ...Template,
  args: {
    strategySlug: '',
    variant: 'placeholder'
  }
}

export const PlaceHolderFilled = {
  ...Template,
  args: {
    strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view',
    variant: 'placeholder'
  }
}

export default StrategySectionStory
