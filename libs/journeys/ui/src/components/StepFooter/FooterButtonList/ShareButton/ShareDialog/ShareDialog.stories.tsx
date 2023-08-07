import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

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
