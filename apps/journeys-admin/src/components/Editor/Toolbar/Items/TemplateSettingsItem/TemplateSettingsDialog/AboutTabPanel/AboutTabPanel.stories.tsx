import { Meta, StoryObj } from '@storybook/nextjs'
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

const Template: StoryObj<
  ComponentProps<typeof AboutTabPanel> & {
    creatorDescription
    strategySlug: string
    errors: { strategySlug: string; creatorDetails: string }
    journey: Journey
  }
> = {
  render: (args) => (
    <JourneyProvider value={{ journey: args.journey }}>
      <FormikProvider
        value={
          {
            values: {
              creatorDescription: args.creatorDescription,
              strategySlug: args.strategySlug
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
    errors: {},
    strategySlug: ''
  }
}

export const WithCanvaEmbed = {
  ...Template,
  args: {
    ...Default.args,
    strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view'
  }
}

export const WithGoogleEmbed = {
  ...Template,
  args: {
    ...Default.args,
    strategySlug:
      'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
  }
}

export const Error = {
  ...Template,
  args: {
    ...Default.args,
    strategySlug: 'www.example.com',
    errors: { strategySlug: 'Invalid embed link' }
  }
}

export default AboutTabPanelStory
