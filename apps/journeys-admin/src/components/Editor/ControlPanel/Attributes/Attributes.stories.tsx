import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { Attributes } from '.'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourneyForEdit'
import { TreeBlock } from '@core/journeys/ui'
import { EditorProvider } from '../../Context'

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
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: []
      }
    ]
  }

  return (
    <EditorProvider>
      <Attributes selected={selected} />
    </EditorProvider>
  )
}

export default AttributesStory as Meta
