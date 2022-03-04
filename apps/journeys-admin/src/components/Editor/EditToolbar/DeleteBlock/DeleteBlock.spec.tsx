import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import { SnackbarProvider } from 'notistack'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../__generated__/GetJourney'
import {
  TypographyVariant,
  TypographyAlign,
  TypographyColor
} from '../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../libs/context'
import { BLOCK_DELETE } from './DeleteBlock'
import { DeleteBlock } from '.'

const selectedBlock: TreeBlock<TypographyBlock> = {
  id: 'typography.id',
  __typename: 'TypographyBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  content: 'Title',
  variant: TypographyVariant.h1,
  color: TypographyColor.primary,
  align: TypographyAlign.center,
  children: []
}

const selectedStep: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'stepId',
  parentBlockId: 'journeyId',
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  children: [
    {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'stepId',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [
        selectedBlock,
        {
          id: 'typography1.id',
          __typename: 'TypographyBlock',
          parentBlockId: 'card1.id',
          parentOrder: 1,
          content: 'Title',
          variant: TypographyVariant.h1,
          color: TypographyColor.primary,
          align: TypographyAlign.center,
          children: []
        }
      ]
    }
  ]
}

describe('DeleteBlock', () => {
  it('should call handleDeleteBlock on click', () => {
    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <DeleteBlock variant="button" />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toContainElement(
      getByTestId('DeleteOutlineRoundedIcon')
    )
  })

  it('should call the mutation on Delete Icon click', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock: ${selectedBlock.id}` },
          { __ref: `TypographyBlock:typography1.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const result = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            id: selectedBlock.id,
            parentBlockId: selectedBlock.parentBlockId,
            journeyId: 'journeyId'
          }
        ]
      }
    }))
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: {
                  id: selectedBlock.id,
                  parentBlockId: selectedBlock.parentBlockId,
                  journeyId: 'journeyId'
                }
              },
              result
            }
          ]}
        >
          <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should call the mutation on Delete Block on list-item click', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock: ${selectedBlock.id}` },
          { __ref: `TypographyBlock:typography1.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const result = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            id: selectedBlock.id,
            parentBlockId: selectedBlock.parentBlockId,
            journeyId: 'journeyId'
          }
        ]
      }
    }))
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: {
                  id: selectedBlock.id,
                  parentBlockId: selectedBlock.parentBlockId,
                  journeyId: 'journeyId'
                }
              },
              result
            }
          ]}
        >
          <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('menuitem')).toBeInTheDocument()
    fireEvent.click(getByRole('menuitem'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
