import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock, JourneyProvider } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../../__generated__/GetJourney'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../../../../__generated__/globalTypes'
import { SelectedCard, STEP_BLOCK_DEFAULT_NEXT_BLOCK_UPDATE } from '.'

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

  it('updates nextBlockId to the step itself on remove button click', async () => {
    const result = jest.fn(() => ({
      data: {
        stepBlockUpdate: {
          id: 'step0.id',
          nextBlockId: 'step0.id'
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
                  nextBlockId: selectedBlock.id
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
              themeName: ThemeName.base
            } as unknown as Journey,
            admin: true
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
        <JourneyProvider>
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
        <JourneyProvider>
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
