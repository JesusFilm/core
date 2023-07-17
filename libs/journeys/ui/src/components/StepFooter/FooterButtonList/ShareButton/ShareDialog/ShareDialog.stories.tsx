import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import noop  from 'lodash/noop'
import { journeyUiConfig } from '../../../../../libs/journeyUiConfig'
import { ShareDialog } from './ShareDialog'

const Demo = {
  ...journeyUiConfig,
  component: ShareDialog,
  title: 'Journeys-Ui/StepFooter/FooterButtonList/ShareButton/ShareDialog',
  parameters: {
    ...journeyUiConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof ShareDialog>> = ({ ...args }) => (
  <SnackbarProvider>
    <ShareDialog {...args} />
  </SnackbarProvider>
)

export const Default = Template.bind({})
Default.args = {
  url: 'test-slug',
  open: true,
  closeDialog: noop
}

export default Demo as Meta
