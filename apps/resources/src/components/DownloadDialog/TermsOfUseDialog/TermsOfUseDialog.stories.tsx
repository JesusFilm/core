import { Meta, StoryObj } from '@storybook/nextjs'

import { watchConfig } from '../../../libs/storybook'

import { TermsOfUseDialog } from './TermsOfUseDialog'

const TermsOfUseDialogStory: Meta<typeof TermsOfUseDialog> = {
  ...watchConfig,
  component: TermsOfUseDialog,
  title: 'Watch/TermsOfUseDialog',
  argTypes: {
    onClose: { action: 'close clicked' },
    onSubmit: { action: 'submit clicked' }
  }
}

const Template: StoryObj<typeof TermsOfUseDialog> = {
  render: ({ ...args }) => {
    return <TermsOfUseDialog {...args} />
  }
}

export const Default = {
  ...Template,
  args: {
    open: true
  }
}

export default TermsOfUseDialogStory
