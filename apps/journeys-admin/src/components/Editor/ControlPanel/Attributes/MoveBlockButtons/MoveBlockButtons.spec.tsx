import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'

import { BLOCK_ORDER_UPDATE, MoveBlockButtons } from '.'

describe('MoveBlockButton', () => {
  const block1: TreeBlock = {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'Text1',
    variant: null,
    children: []
  }

  const block2: TreeBlock = {
    id: 'typographyBlockId2',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'Text2',
    variant: null,
    children: []
  }

  const step: TreeBlock = {
    __typename: 'StepBlock',
    id: 'step0.id',
    parentBlockId: null,
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step0.id',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [block1, block2]
      }
    ]
  }

  const result = jest.fn(() => ({
    data: {
      blockOrderUpdate: [
        {
          __typename: 'TypographyBlock',
          id: 'typographyBlockId2',
          parentOrder: 0
        },
        {
          __typename: 'TypographyBlock',
          id: 'typographyBlockId1',
          parentOrder: 1
        }
      ]
    }
  }))

  it('should move selected block up on click', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_ORDER_UPDATE,
              variables: {
                id: 'typographyBlockId2',
                journeyId: 'journeyId',
                parentOrder: 0
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <MoveBlockButtons selectedBlock={block2} selectedStep={step} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'move-block-up' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should move selected block down on click', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_ORDER_UPDATE,
              variables: {
                id: 'typographyBlockId1',
                journeyId: 'journeyId',
                parentOrder: 1
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <MoveBlockButtons selectedBlock={block1} selectedStep={step} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'move-block-down' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should disable move up if first block', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <MoveBlockButtons selectedBlock={block1} selectedStep={step} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'move-block-up' })).toBeDisabled()
    expect(getByRole('button', { name: 'move-block-down' })).not.toBeDisabled()
  })

  it('should disable move down if last block', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <MoveBlockButtons selectedBlock={block2} selectedStep={step} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'move-block-up' })).not.toBeDisabled()
    expect(getByRole('button', { name: 'move-block-down' })).toBeDisabled()
  })

  it('should disable move if single block', async () => {
    const card: TreeBlock = {
      id: 'card0.id',
      __typename: 'CardBlock',
      parentBlockId: 'step0.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [block1]
    }

    const stepWithOneBlock = { ...step, children: [card] }

    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <MoveBlockButtons
            selectedBlock={block1}
            selectedStep={stepWithOneBlock}
          />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'move-block-up' })).toBeDisabled()
    expect(getByRole('button', { name: 'move-block-down' })).toBeDisabled()
  })
})
