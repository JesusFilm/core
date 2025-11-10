import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { journeyUiConfig } from '../../../../../libs/journeyUiConfig'

import { ShareDialog } from './ShareDialog'

const Demo: Meta<typeof ShareDialog> = {
  ...journeyUiConfig,
  component: ShareDialog,
  title: 'Journeys-Ui/StepFooter/FooterButtonList/ShareButton/ShareDialog',
  parameters: {
    ...journeyUiConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof ShareDialog> = {
  render: ({ ...args }) => (
    <SnackbarProvider>
      <ShareDialog {...args} />
    </SnackbarProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    url: 'test-slug',
    open: true,
    closeDialog: noop
  }
}

export default Demo
