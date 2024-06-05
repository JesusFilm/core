import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { journey } from '../../Editor/Slider/Settings/GoalDetails/data'

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
          <TemplateFooter openTeamDialog={false} setOpenTeamDialog={noop} />
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
