import { MockedProvider } from '@apollo/client/testing'
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

import { ContextEditActions } from '.'

const ContextEditActionsStory = {
  ...simpleComponentConfig,
  component: ContextEditActions,
  title: 'Journeys-Admin/Editor/ContextEditActions'
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
          <ContextEditActions />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default ContextEditActionsStory as Meta
