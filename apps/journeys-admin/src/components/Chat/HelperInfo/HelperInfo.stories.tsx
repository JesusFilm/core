import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { simpleComponentConfig } from '../../../libs/storybook'
import { HelperInfo } from '.'

const HelperInfoStory = {
  ...simpleComponentConfig,
  component: HelperInfo,
  title: 'Journeys-Admin/Chat/HelperInfo'
}

const Template: Story<ComponentProps<typeof HelperInfo>> = (props) => (
  <HelperInfo {...props} />
)

export const Default = Template.bind({})
Default.args = {
  value: 'This is a helper message'
}

export default HelperInfoStory as Meta
