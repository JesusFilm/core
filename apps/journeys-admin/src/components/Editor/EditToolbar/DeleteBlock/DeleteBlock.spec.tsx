import { EditorProvider, TreeBlock, JourneyProvider } from '@core/journeys/ui'
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
import { STEP_BLOCK_NEXTBLOCKID_UPDATE } from '../../../CardPreview/CardPreview'
import { DeleteBlock, BLOCK_DELETE } from './DeleteBlock'

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
const block1: TreeBlock<TypographyBlock> = {
  ...selectedBlock,
  id: 'typography1.id',
  parentOrder: 1
}
const block2: TreeBlock<TypographyBlock> = {
  ...selectedBlock,
  id: 'typography2.id',
  parentOrder: 2
}

const selectedStep: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step2.id',
  parentBlockId: null,
  parentOrder: 1,
  locked: true,
  nextBlockId: 'step3.id',
  children: [
    {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step2.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [selectedBlock, block1, block2]
    }
  ]
}

const step1: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step1.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: true,
  nextBlockId: 'step2.id',
  children: []
}

const step3: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step3.id',
  parentBlockId: null,
  parentOrder: 2,
  locked: true,
  nextBlockId: null,
  children: []
}

const steps: Array<TreeBlock<StepBlock>> = [step1, selectedStep, step3]

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
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              admin: true
            }}
          >
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
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              admin: true
            }}
          >
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await fireEvent.click(getByRole('menuitem', { name: 'Delete Block' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:card1.id' }
    ])
  })

  it('should delete card on button click', async () => {
    const selectedBlock = selectedStep

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `StepBlock:step2.id` },
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'StepBlock:step2.id': {
        ...selectedStep
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
        blockDelete: []
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
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              admin: true
            }}
          >
            <EditorProvider initialState={{ selectedBlock }}>
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

    expect(getByRole('dialog', { name: 'Delete Card?' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([])
  })

  it('should delete card on menu click', async () => {
    const selectedBlock = selectedStep

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `StepBlock:step2.id` },
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'StepBlock:step2.id': {
        ...selectedStep
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
        blockDelete: []
      }
    }))

    const { getByRole, queryByRole } = render(
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
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              admin: true
            }}
          >
            <EditorProvider initialState={{ selectedBlock }}>
              <DeleteBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Delete Card' }))

    expect(getByRole('dialog', { name: 'Delete Card?' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([])
    await waitFor(() => expect(queryByRole('menu')).not.toBeInTheDocument())
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('should be disabled if nothing is selected', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <DeleteBlock variant={'button'} />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toBeDisabled()
  })

  it('should set nextBlockId for previous block', async () => {
    const result = jest.fn(() => ({
      data: {
        stepBlockUpdate: {
          __typename: 'StepBlock',
          id: 'step1.id',
          nextBlockId: 'step3.id'
        }
      }
    }))

    const selectedBlock = selectedStep

    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: {
                  id: 'step2.id',
                  parentBlockId: null,
                  journeyId: 'journeyId'
                }
              },
              result: {
                data: {
                  blockDelete: [step1, step3]
                }
              }
            },
            {
              request: {
                query: STEP_BLOCK_NEXTBLOCKID_UPDATE,
                variables: {
                  id: 'step1.id',
                  journeyId: 'journeyId',
                  input: {
                    nextBlockId: 'step3.id'
                  }
                }
              },
              result
            }
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              admin: true
            }}
          >
            <EditorProvider
              initialState={{ steps, selectedBlock, selectedStep }}
            >
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

    expect(getByRole('dialog', { name: 'Delete Card?' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
