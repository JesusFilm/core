import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'

import { StrategySection } from './StrategySection'

const StrategySectionStory: Meta<typeof StrategySection> = {
  ...journeysAdminConfig,
  component: StrategySection,
  title: 'Journeys-Admin/StrategySection'
}

const Template: StoryObj<typeof StrategySection> = {
  render: ({ ...args }) => <StrategySection strategySlug={args.strategySlug} />
}

export const Canva = {
  ...Template,
  args: {
    strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view'
  }
}

export const CanvaMovie = {
  ...Template,
  args: {
    strategySlug: 'https://www.canva.com/design/DAFvCrg6dMw/watch'
  }
}

export const GoogleSlides = {
  ...Template,
  args: {
    strategySlug:
      'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
  }
}

export default StrategySectionStory
