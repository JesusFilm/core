import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'

import { journey } from './data'
import { TemplateFooter } from './TemplateFooter'

const TemplateFooterStory: Meta<typeof TemplateFooter> = {
  ...simpleComponentConfig,
  component: TemplateFooter,
  title: 'Journeys-Admin/TemplateView/TemplateFooter'
}

const Template: StoryObj<
  ComponentProps<typeof TemplateFooter> & { journey: Journey }
> = {
  render: (args) => {
    return (
      <MockedProvider>
        <JourneyProvider value={{ journey: args.journey }}>
          <TemplateFooter />
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    journey
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: undefined
  }
}

export default TemplateFooterStory
