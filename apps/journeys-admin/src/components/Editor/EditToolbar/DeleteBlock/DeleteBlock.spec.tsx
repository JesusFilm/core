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
  id: 'typography0.id',
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
      children: [selectedBlock]
    }
  ]
}

describe('DeleteBlock', () => {
  it('should delete a block on button click', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })
    const result = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            id: selectedBlock.id,
            parentBlockId: selectedBlock.parentBlockId,
            parentOrder: selectedBlock.parentOrder,
            journeyId: 'journeyId'
          }
        ]
      }
    }))
    const { getByRole, getByTestId } = render(
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
    expect(getByRole('button')).toContainElement(
      getByTestId('DeleteOutlineRoundedIcon')
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:card1.id' }
    ])
  })

  it('should delete a block on menu item click', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })
    const result = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            id: selectedBlock.id,
            parentBlockId: selectedBlock.parentBlockId,
            parentOrder: selectedBlock.parentOrder,
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
    fireEvent.click(getByRole('menuitem', { name: 'Delete Block' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:card1.id' }
    ])
  })

  it('should not delete if no step is selected', async () => {
    const result = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            id: selectedBlock.id,
            parentBlockId: selectedBlock.parentBlockId,
            parentOrder: selectedBlock.parentOrder,
            journeyId: 'journeyId'
          }
        ]
      }
    }))
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
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
            <EditorProvider
              initialState={{
                selectedBlock
              }}
            >
              <DeleteBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('should not delete if no block selected', async () => {
    const result = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            id: selectedBlock.id,
            parentBlockId: selectedBlock.parentBlockId,
            parentOrder: selectedBlock.parentOrder,
            journeyId: 'journeyId'
          }
        ]
      }
    }))
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
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
            <EditorProvider
              initialState={{
                selectedStep
              }}
            >
              <DeleteBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('should not delete if selectedBlock is CardBlock', async () => {
    const result = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            id: selectedBlock.id,
            parentBlockId: selectedBlock.parentBlockId,
            parentOrder: selectedBlock.parentOrder,
            journeyId: 'journeyId'
          }
        ]
      }
    }))
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: {
                  id: selectedStep.children[0].id,
                  parentBlockId: selectedStep.children[0].parentBlockId,
                  journeyId: 'journeyId'
                }
              },
              result
            }
          ]}
        >
          <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
            <EditorProvider
              initialState={{
                selectedStep,
                selectedBlock: selectedStep.children[0]
              }}
            >
              <DeleteBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })
})
