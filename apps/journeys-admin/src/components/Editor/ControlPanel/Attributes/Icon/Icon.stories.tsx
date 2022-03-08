import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { Drawer } from '../../../Drawer'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../__generated__/GetJourney'
import {
  IconName,
  IconColor,
  IconSize
} from '../../../../../../__generated__/globalTypes'
import { Icon } from '.'

const IconStory = {
  ...journeysAdminConfig,
  component: Icon,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Icon'
}

export const Default: Story = () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: null,
    children: [
      {
        id: 'iconBlock.id',
        parentBlockId: 'buttonBlockId',
        parentOrder: null,
        __typename: 'IconBlock',
        iconName: null,
        iconSize: null,
        iconColor: null,
        children: []
      }
    ]
  }

  return (
    <MockedProvider>
      <EditorProvider
        initialState={{
          selectedBlock,
          drawerChildren: <Icon id={'iconBlock.id'} />,
          drawerTitle: 'Start Icon',
          drawerMobileOpen: true
        }}
      >
        <Drawer />
      </EditorProvider>
    </MockedProvider>
  )
}

export const Filled: Story = () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: null,
    children: [
      {
        __typename: 'IconBlock',
        id: 'iconBlock.id',
        parentBlockId: null,
        parentOrder: null,
        iconName: IconName.ArrowForwardRounded,
        iconSize: IconSize.md,
        iconColor: IconColor.primary,
        children: []
      }
    ]
  }

  return (
    <MockedProvider>
      <EditorProvider
        initialState={{
          selectedBlock,
          drawerChildren: <Icon id={'iconBlock.id'} />,
          drawerTitle: 'Start Icon',
          drawerMobileOpen: true
        }}
      >
        <Drawer />
      </EditorProvider>
    </MockedProvider>
  )
}
export default IconStory as Meta
