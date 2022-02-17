import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { Icon } from '.'

const IconStory = {
  ...simpleComponentConfig,
  component: Icon,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Icon'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <Icon type={'start'} />
    </MockedProvider>
  )
}
export default IconStory as Meta
