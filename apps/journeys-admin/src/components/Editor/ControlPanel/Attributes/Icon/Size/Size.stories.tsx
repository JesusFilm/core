import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import {
  IconName,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { Size } from '.'

const SizeStory = {
  ...simpleComponentConfig,
  component: Size,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Icon'
}

export const SizeOptions: Story = () => {
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
        iconSize: null,
        iconColor: null,
        children: []
      }
    ]
  }
  return (
    <MockedProvider>
      <EditorProvider initialState={{ selectedBlock }}>
        <Size id={'iconBlock.id'} size={IconSize.md} />
      </EditorProvider>
    </MockedProvider>
  )
}

export default SizeStory as Meta
