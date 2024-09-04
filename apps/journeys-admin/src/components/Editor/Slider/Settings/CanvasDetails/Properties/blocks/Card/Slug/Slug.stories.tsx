import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ComponentPropsWithoutRef } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../../../../__generated__/GetJourney'

import { Slug } from '.'

const Demo: Meta<typeof Slug> = {
  ...simpleComponentConfig,
  component: Slug,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Card/Slug'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof Slug>> = {
  render: (args) => {
    const selectedStep = {
      __typename: 'StepBlock',
      id: 'stepId',
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>
    const initialState = {
      selectedStep
    } as unknown as EditorState

    return (
      <MockedProvider>
        <CommandProvider>
          <SnackbarProvider>
            <JourneyProvider>
              <EditorProvider initialState={initialState}>
                <Slug />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </CommandProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {}
}

export default Demo
