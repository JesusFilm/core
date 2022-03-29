import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../libs/storybook'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../__generated__/GetJourney'
import { EditToolbar } from '.'

const EditToolbarStory = {
  ...simpleComponentConfig,
  component: EditToolbar,
  title: 'Journeys-Admin/Editor/EditToolbar'
}

export const Default: Story = () => {
  const selectedBlock: TreeBlock<TypographyBlock> = {
    id: 'typography0.id',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    content: 'Title',
    variant: null,
    color: null,
    align: null,
    children: []
  }

  return (
    <MockedProvider>
      <EditorProvider initialState={{ selectedBlock }}>
        <EditToolbar />
      </EditorProvider>
    </MockedProvider>
  )
}

export default EditToolbarStory as Meta
