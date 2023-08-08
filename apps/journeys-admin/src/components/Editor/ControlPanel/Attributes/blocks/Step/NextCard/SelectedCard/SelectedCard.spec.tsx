import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../__generated__/globalTypes'

import { STEP_BLOCK_DEFAULT_NEXT_BLOCK_UPDATE, SelectedCard } from '.'

describe('Selected Card', () => {
  const selectedBlock: TreeBlock<StepBlock> = {
    id: 'step0.id',
    nextBlockId: 'step2.id',
    parentBlockId: null,
    __typename: 'StepBlock',
    parentOrder: 0,
    locked: false,
    children: []
  }

  const nextBlock: TreeBlock<StepBlock> = {
    ...selectedBlock,
    id: 'step1.id',
    nextBlockId: 'step2.id',
    parentOrder: 1
  }

  const noNextBlockId: TreeBlock<StepBlock> = {
    ...selectedBlock,
    id: 'step2.id',
    nextBlockId: null,
    parentOrder: 2
  }

  const lastBlock: TreeBlock<StepBlock> = {
    ...selectedBlock,
    id: 'step3.id',
    nextBlockId: null,
    parentOrder: 3
  }

  const steps = [selectedBlock, nextBlock, noNextBlockId, lastBlock]

  it('removes nextBlockId on remove button click', async () => {
    const result = jest.fn(() => ({
      data: {
        stepBlockUpdate: {
          id: 'step0.id',
          nextBlockId: null
        }
      }
    }))

    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: STEP_BLOCK_DEFAULT_NEXT_BLOCK_UPDATE,
              variables: {
                id: selectedBlock.id,
                journeyId: 'journeyId',
                input: {
                  nextBlockId: null
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base,
              language: {
                __typename: 'Language',
                id: '529',
                bcp47: 'en',
                iso3: 'eng'
              }
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ steps, selectedBlock }}>
            <SelectedCard />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('removeCustomNextStep'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('selects the card after through parentOrder if no nextBlockId', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ variant: 'admin' }}>
          <EditorProvider
            initialState={{
              steps,
              selectedBlock: noNextBlockId
            }}
          >
            <SelectedCard />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Default next step in journey')).toBeInTheDocument()
  })

  it('does not select a next step if last', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ variant: 'admin' }}>
          <EditorProvider
            initialState={{
              steps,
              selectedBlock: lastBlock
            }}
          >
            <SelectedCard />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('No next step in journey')).toBeInTheDocument()
  })
})
