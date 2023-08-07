import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { simpleComponentConfig } from '../../../libs/storybook'
import {
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey as Journey
} from '../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
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
      <JourneyProvider
        value={{
          journey: { status: JourneyStatus.published } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <EditToolbar />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default EditToolbarStory as Meta
