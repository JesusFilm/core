import { Story, Meta } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { sharedUiConfig } from '../..'
import { CopyTextFieldProps } from './CopyTextField'
import { CopyTextField } from '.'

const Demo = {
  ...sharedUiConfig,
  component: CopyTextField,
  title: 'Shared-Ui/CopyTextField',
  parameters: {
    chromatic: {
      ...sharedUiConfig.parameters.chromatic,
      viewports: [1200]
    }
  }
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

export const Custom = Template.bind({})
Custom.args = {
  label: 'Editor Invite URL',
  value: 'https://admin.nextstep.is/journeys/slug',
  messageText: 'Editor invite link copied',
  helperText:
    'Anyone with this link can see journey and ask for editing rights. You can accept or reject every request.'
}

export default Demo as Meta
