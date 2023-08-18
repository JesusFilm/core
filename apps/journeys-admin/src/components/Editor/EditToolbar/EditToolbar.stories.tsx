import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock
} from '../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../libs/storybook'

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
          <Stack direction="row">
            <EditToolbar />
          </Stack>
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default EditToolbarStory as Meta
