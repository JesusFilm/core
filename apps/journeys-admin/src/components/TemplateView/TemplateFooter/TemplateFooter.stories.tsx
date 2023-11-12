import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { simpleComponentConfig } from '../../../libs/storybook'
import { journey } from '../../Editor/ActionDetails/data'

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
