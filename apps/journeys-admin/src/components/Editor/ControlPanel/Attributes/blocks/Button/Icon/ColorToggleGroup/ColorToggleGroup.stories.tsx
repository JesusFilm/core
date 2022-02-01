import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
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
      <ColorToggleGroup id={'button-color-id'} color={null} />
    </MockedProvider>
  )
}

export default ColorToggleGroupStory as Meta
