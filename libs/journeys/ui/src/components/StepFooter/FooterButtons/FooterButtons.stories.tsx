import { Story, Meta } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { journeyUiConfig } from '../../../libs/journeyUiConfig'
import { FooterButtons } from './FooterButtons'

const Demo = {
  ...journeyUiConfig,
  component: FooterButtons,
  title: 'Journeys-Ui/StepFooter/FooterButtons'
}

const Template: Story = () => (
  <SnackbarProvider>
    <FooterButtons />
  </SnackbarProvider>
)

export const Default = Template.bind({})

export default Demo as Meta
