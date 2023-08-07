import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { watchConfig } from '../../../libs/storybook'

import { TermsOfUseDialog } from './TermsOfUseDialog'

const TermsOfUseDialogStory = {
  ...watchConfig,
  component: TermsOfUseDialog,
  title: 'Watch/TermsOfUseDialog',
  argTypes: {
    onClose: { action: 'close clicked' },
    onSubmit: { action: 'submit clicked' }
  }
}

const Template: Story<ComponentProps<typeof TermsOfUseDialog>> = ({
  ...args
}) => {
  return <TermsOfUseDialog {...args} />
}

export const Default = Template.bind({})
Default.args = {
  open: true
}

export default TermsOfUseDialogStory as Meta
