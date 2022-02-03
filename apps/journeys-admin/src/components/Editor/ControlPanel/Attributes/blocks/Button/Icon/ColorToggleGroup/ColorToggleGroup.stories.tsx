import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { IconType } from '..'
import { ColorToggleGroup } from '.'

const ColorToggleGroupStory = {
  ...simpleComponentConfig,
  component: ColorToggleGroup,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Icon/ColorToggleGroup'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <ColorToggleGroup type={IconType.start} />
    </MockedProvider>
  )
}

export default ColorToggleGroupStory as Meta
