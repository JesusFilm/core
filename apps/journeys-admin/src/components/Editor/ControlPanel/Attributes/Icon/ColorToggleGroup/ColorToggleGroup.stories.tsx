import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { IconFields } from '../../../../../../../__generated__/IconFields'
import { IconName } from '../../../../../../../__generated__/globalTypes'
import { ColorToggleGroup } from '.'

const ColorToggleGroupStory = {
  ...simpleComponentConfig,
  component: ColorToggleGroup,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Icon/ColorToggleGroup'
}

export const Default: Story = () => {
  const icon: TreeBlock<IconFields> = {
    id: 'icon-id',
    parentBlockId: 'buttonBlockId',
    parentOrder: null,
    __typename: 'IconBlock',
    iconName: IconName.ArrowForwardRounded,
    iconSize: null,
    iconColor: null,
    children: []
  }
  return (
    <MockedProvider>
      <ColorToggleGroup iconBlock={icon} />
    </MockedProvider>
  )
}

export default ColorToggleGroupStory as Meta
