import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { noop } from 'lodash'
import { watchConfig } from '../../../libs/storybook'
import { TermsOfUseModal } from './TermsOfUseModal'

const TermsOfUseModalStory = {
  ...watchConfig,
  component: TermsOfUseModal,
  title: 'Watch/TermsOfUseModal',
  parameters: {
    theme: 'light'
  }
}

const Template: Story<ComponentProps<typeof TermsOfUseModal>> = ({
  ...args
}) => {
  return <TermsOfUseModal {...args} />
}

export const Default = Template.bind({})
Default.args = {
  open: true,
  onClose: noop
}

export default TermsOfUseModalStory as Meta
