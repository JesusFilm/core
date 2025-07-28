import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { JourneyMenuButtonIcon } from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { defaultJourney } from '../../TemplateView/data'

import { StepHeaderMenu } from '.'

const menuStep = {
  id: 'menuStep.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 1,
  locked: true,
  nextBlockId: null,
  slug: 'menu',
  children: []
}

const Demo: Meta<typeof StepHeaderMenu> = {
  ...simpleComponentConfig,
  component: StepHeaderMenu,
  title: 'Journeys-Ui/StepHeader/StepHeaderMenu'
}

type Story = StoryObj<{
  journey: Journey
  variant: 'default' | 'admin' | 'embed'
}>

const Template: Story = {
  render: ({ journey, variant }) => {
    return (
      <MockedProvider>
        <JourneyProvider value={{ journey, variant }}>
          <StepHeaderMenu />
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const AdminFallback: Story = {
  ...Template,
  args: {
    journey: defaultJourney,
    variant: 'admin'
  }
}

export const MenuIcon: Story = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      menuStepBlock: menuStep,
      menuButtonIcon: JourneyMenuButtonIcon.home3
    },
    variant: 'default'
  }
}

export const CloseIcon: Story = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      menuStepBlock: menuStep,
      menuButtonIcon: JourneyMenuButtonIcon.home3,
      blocks: [menuStep]
    },
    variant: 'default'
  }
}

export default Demo
