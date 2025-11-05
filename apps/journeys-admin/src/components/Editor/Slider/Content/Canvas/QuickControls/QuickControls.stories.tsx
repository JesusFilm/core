import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetAdminJourney_journey_blocks as Block } from '../../../../../../../__generated__/GetAdminJourney'

import { QuickControls } from '.'

const QuickControlsDemo: Meta<typeof QuickControls> = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/Editor/Slider/Content/Canvas/QuickControls'
}

const Template: StoryObj<{ selectedBlock: TreeBlock<Block> }> = {
  render: ({ selectedBlock }) => (
    <MockedProvider>
      <SnackbarProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <QuickControls open anchorEl={null} block={selectedBlock} />
        </EditorProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    selectedBlock: {
      __typename: 'TypographyBlock',
      id: 'typographyBlock.id',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    }
  }
}

export const Disabled = {
  ...Template,
  args: {
    selectedBlock: {
      __typename: 'VideoBlock',
      id: 'videoBlock.id',
      parentOrder: 0
    }
  }
}

export default QuickControlsDemo
