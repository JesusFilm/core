import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../../../__generated__/GetJourney'
import { Conditions } from '.'

const ConditionsStory = {
  ...simpleComponentConfig,
  component: Conditions,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Step/NextCard/Conditions'
}

export const Default: Story = () => {
  const selectedBlock: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    nextBlockId: null,
    parentOrder: 0,
    locked: false,
    children: []
  }
  return (
    <MockedProvider>
      <EditorProvider initialState={{ selectedBlock }}>
        <Conditions />
      </EditorProvider>
    </MockedProvider>
  )
}
export const Locked: Story = () => {
  const selectedBlock: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    nextBlockId: null,
    parentOrder: 0,
    locked: true,
    children: []
  }
  return (
    <MockedProvider>
      <EditorProvider initialState={{ selectedBlock }}>
        <Conditions />
      </EditorProvider>
    </MockedProvider>
  )
}

export default ConditionsStory as Meta
