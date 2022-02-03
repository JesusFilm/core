import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { IconType } from '..'
import { SizeToggleGroup } from '.'

const SizeToggleGroupStory = {
  ...simpleComponentConfig,
  component: SizeToggleGroup,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Icon/SizeToggleGroup'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <SizeToggleGroup type={IconType.start} />
    </MockedProvider>
  )
}

export default SizeToggleGroupStory as Meta
