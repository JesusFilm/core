import { Meta, Story } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { journeyUiConfig } from '../../../../libs/journeyUiConfig'
import {
  JourneyProvider,
  RenderLocation
} from '../../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { ShareButton } from './ShareButton'

const Demo = {
  ...journeyUiConfig,
  component: ShareButton,
  title: 'Journeys-Ui/StepFooter/FooterButtons/ShareButton'
}

const Template: Story = () => (
  <SnackbarProvider>
    <JourneyProvider
      value={{
        journey: { slug: 'test-slug' } as unknown as Journey,
        renderLocation: RenderLocation.Journey
      }}
    >
      <ShareButton />
    </JourneyProvider>
  </SnackbarProvider>
)

export const Default = Template.bind({})

export default Demo as Meta
