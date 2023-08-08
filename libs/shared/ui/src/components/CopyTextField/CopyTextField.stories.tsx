import { Meta, Story } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { simpleComponentConfig } from '../../libs/simpleComponentConfig'

import { CopyTextFieldProps } from './CopyTextField'

import { CopyTextField } from '.'

const Demo = {
  ...simpleComponentConfig,
  component: CopyTextField,
  title: 'Shared-Ui/CopyTextField'
}
const Template: Story<CopyTextFieldProps> = ({ ...args }) => {
  return (
    <SnackbarProvider>
      <CopyTextField {...args} />
    </SnackbarProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  value: 'https://your.nextstep.is'
}

export const Loading = Template.bind({})
Default.args = {
  value: undefined
}

export const Custom = Template.bind({})
Custom.args = {
  label: 'Editor Invite URL',
  value: 'https://admin.nextstep.is/journeys/slug',
  messageText: 'Editor invite link copied',
  helperText:
    'Anyone with this link can see journey and ask for editing rights. You can accept or reject every request.'
}

export default Demo as Meta
