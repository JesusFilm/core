import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { IconFields } from '../../../../../../../__generated__/IconFields'
import { IconName } from '../../../../../../../__generated__/globalTypes'
import { Size } from '.'

const SizeStory = {
  ...simpleComponentConfig,
  component: Size,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Icon/Size'
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
      <Size iconBlock={icon} />
    </MockedProvider>
  )
}

export default SizeStory as Meta
