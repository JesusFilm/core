import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { Attributes } from '.'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourneyForEdit'
import { TreeBlock } from '@core/journeys/ui'

const AttributesStory = {
  ...journeysAdminConfig,
  component: Attributes,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes'
}

export const Default: Story = () => {
  const selected: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    locked: false,
    nextBlockId: 'step2.id',
    children: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: 'image1.id',
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: true,
        children: []
      }
    ]
  }

  return <Attributes selected={selected} />
}

export default AttributesStory as Meta
