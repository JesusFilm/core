import { Meta, StoryObj } from '@storybook/react'
import { Formik } from 'formik'
import { HttpResponse, http } from 'msw'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { TemplateSettingsFormValues } from '../useTemplateSettingsForm'

import { ContextTabPanel } from './ContextTabPanel'

const ContextTabPanelStory: Meta<typeof ContextTabPanel> = {
  ...simpleComponentConfig,
  component: ContextTabPanel,
  title:
    'Journeys-Admin/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsDialog/ContextTabPanel',
  parameters: {
    ...simpleComponentConfig.parameters
  }
}

const noop = () => undefined

const Template: StoryObj<
  ComponentProps<typeof ContextTabPanel> & {
    context?: string
    errors?: { context?: string }
    loading?: boolean
  }
> = {
  render: (args) => (
    <JourneyProvider value={{ journey: defaultJourney }}>
      <Formik
        initialValues={
          { context: args.context ?? '' } as TemplateSettingsFormValues
        }
        onSubmit={noop}
      >
        <ContextTabPanel />
      </Formik>
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    context: '',
    errors: {}
  }
}

const storyExport = {
  ...ContextTabPanelStory,
  parameters: {
    ...ContextTabPanelStory.parameters,
    msw: {
      handlers: [
        http.post('/api/journey/context', () => {
          return HttpResponse.json({
            text: `# Dev Onboarding Journey (Template)

**Purpose:** Development and staging environment use only. Do not use in production.

**Key Features:**

*   **Template:** Designed as a template for creating actual onboarding journeys.
*   **English Language:** Content is in English.
*   **Step-by-Step:** Contains a StepBlock with nested CardBlock and TypographyBlocks.
*   **Image Support:** Includes ImageBlocks for visual elements.
*   **Dark Theme:** Utilizes a dark theme mode.
*   **Team:** Associated with the "Jesus Film Project" team.
*   **Published:** Currently in a published state.
`
          })
        })
      ]
    }
  }
}

export default storyExport
