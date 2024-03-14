import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../libs/storybook'

import { Toolbar } from '.'

const ToolbarStory: Meta<typeof Toolbar> = {
  ...simpleComponentConfig,
  component: Toolbar,
  title: 'Journeys-Admin/Editor/Toolbar'
}

export const Default: StoryObj<typeof Toolbar> = {
  render: () => {
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
            journey: {
              status: JourneyStatus.published,
              tags: []
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <Stack direction="row">
              <Toolbar />
            </Stack>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export default ToolbarStory
