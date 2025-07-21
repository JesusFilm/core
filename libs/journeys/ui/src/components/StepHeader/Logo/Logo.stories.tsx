import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'

import { JourneyProvider } from '../../../libs/JourneyProvider'
import { simpleComponentConfig } from '../../../libs/simpleComponentConfig'
import { GetJourney_journey as Journey } from '../../../libs/useJourneyQuery/__generated__/GetJourney'

import { Logo } from '.'

const Demo: Meta<typeof Logo> = {
  ...simpleComponentConfig,
  component: Logo,
  title: 'Journeys-Ui/StepHeader/Logo'
}

type Story = StoryObj<
  ComponentPropsWithoutRef<typeof Logo> & {
    journey: Journey
    variant: 'default' | 'admin' | 'embed'
  }
>

const Template: Story = {
  render: ({ journey, variant }) => (
    <JourneyProvider value={{ journey, variant }}>
      <Logo />
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: {
      __typename: 'Journey',
      id: 'journeyId',
      logoImageBlock: {
        __typename: 'ImageBlock',
        src: 'https://images.unsplash.com/photo-1725715443838-1574b8eb1c3a?q=80&w=5070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Logo'
      }
    } as unknown as Journey,
    variant: 'default'
  }
}
export const Placeholder = {
  ...Template,
  args: {
    journey: {
      __typename: 'Journey',
      id: 'journeyId',
      logoImageBlock: null
    } as unknown as Journey,
    variant: 'admin'
  }
}

export default Demo
