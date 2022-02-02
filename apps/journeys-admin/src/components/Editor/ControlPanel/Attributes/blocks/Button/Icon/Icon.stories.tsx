import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import {
  IconName,
  IconColor,
  IconSize
} from '../../../../../../../../__generated__/globalTypes'
import { Icon } from '.'

const IconStory = {
  ...simpleComponentConfig,
  component: Icon,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Icon'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <Icon
        id={'button-Icon-id'}
        iconName={undefined}
        iconColor={null}
        iconSize={null}
      />
    </MockedProvider>
  )
}

export const Selected: Story = () => {
  return (
    <MockedProvider>
      <Icon
        id={'button-Icon-id'}
        iconName={IconName.ArrowForwardRounded}
        iconColor={IconColor.error}
        iconSize={IconSize.sm}
      />
    </MockedProvider>
  )
}
export default IconStory as Meta
