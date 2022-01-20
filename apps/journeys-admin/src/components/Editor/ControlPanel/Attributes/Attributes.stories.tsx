import { Story, Meta } from '@storybook/react'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { GetJourneyForEdit_adminJourney_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourneyForEdit'
import { Attributes } from '.'

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
