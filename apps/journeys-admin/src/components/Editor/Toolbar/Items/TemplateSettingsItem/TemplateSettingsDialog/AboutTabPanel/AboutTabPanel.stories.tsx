import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FormikContextType, FormikProvider } from 'formik'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { TemplateSettingsFormValues } from '../useTemplateSettingsForm'

import { AboutTabPanel } from './AboutTabPanel'

const AboutTabPanelStory: Meta<typeof AboutTabPanel> = {
  ...simpleComponentConfig,
  component: AboutTabPanel,
  title:
    'Journeys-Admin/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsDialog/AboutTabPanel',
  parameters: {
    ...simpleComponentConfig.parameters
  }
}

// NES-1678: the WithCanvaEmbed / WithGoogleEmbed / Error variants were
// removed alongside the strategy section UI. The Default story remains
// because it exercises the creator-info field + CustomizeTemplate block.
const Template: StoryObj<
  ComponentProps<typeof AboutTabPanel> & {
    creatorDescription: string
    errors: { creatorDescription?: string }
    journey: Journey
  }
> = {
  render: (args) => (
    <JourneyProvider value={{ journey: args.journey }}>
      <FormikProvider
        value={
          {
            values: {
              creatorDescription: args.creatorDescription
            },
            errors: args.errors
          } as unknown as FormikContextType<TemplateSettingsFormValues>
        }
      >
        <AboutTabPanel />
      </FormikProvider>
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: defaultJourney,
    errors: {}
  }
}

export default AboutTabPanelStory
