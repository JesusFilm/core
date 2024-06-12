import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { simpleComponentConfig } from '../../libs/storybook'

import { CopyTextField } from '.'

const Demo: Meta<typeof CopyTextField> = {
  ...simpleComponentConfig,
  component: CopyTextField,
  title: 'Shared-Ui/CopyTextField'
}
const Template: StoryObj<typeof CopyTextField> = {
  render: ({ ...args }) => {
    return (
      <SnackbarProvider>
        <CopyTextField {...args} />
      </SnackbarProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    value: 'https://your.nextstep.is'
  }
}

export const Loading = {
  ...Template,
  args: {
    value: undefined
  }
}

export const Custom = {
  ...Template,
  args: {
    label: 'Editor Invite URL',
    value: 'https://admin.nextstep.is/journeys/slug',
    messageText: 'Editor invite link copied',
    helperText:
      'Anyone with this link can see journey and ask for editing rights. You can accept or reject every request.'
  }
}

export default Demo
