import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { blockOrderUpdateMock } from '../../../../../../../libs/useBlockOrderUpdateMutation/useBlockOrderUpdateMutation.mock'

import { MoveBlock } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

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
    const mockBlockOrderUpdateMock = {
      request: {
        ...blockOrderUpdateMock.request,
        variables: {
          id: 'typographyBlockId2',
          journeyId: 'journeyId',
          parentOrder: 0
        }
      },
      result
    }

    render(
      <MockedProvider mocks={[mockBlockOrderUpdateMock]}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{ selectedBlock: block2, selectedStep: step }}
          >
            <MoveBlock />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'move-block-up' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should move selected block down on click', async () => {
    const mockBlockOrderUpdateMock = {
      request: {
        ...blockOrderUpdateMock.request,
        variables: {
          id: 'typographyBlockId1',
          journeyId: 'journeyId',
          parentOrder: 1
        }
      },
      result
    }

    render(
      <MockedProvider mocks={[mockBlockOrderUpdateMock]}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{ selectedBlock: block1, selectedStep: step }}
          >
            <MoveBlock />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'move-block-down' })
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should disable move up if first block', async () => {
    render(
      <MockedProvider>
        <EditorProvider
          initialState={{ selectedBlock: block1, selectedStep: step }}
        >
          <MoveBlock />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'move-block-up' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'move-block-down' })
    ).not.toBeDisabled()
  })

  it('should disable move down if last block', async () => {
    render(
      <MockedProvider>
        <EditorProvider
          initialState={{ selectedBlock: block2, selectedStep: step }}
        >
          <MoveBlock />
        </EditorProvider>
      </MockedProvider>
    )

    expect(
      screen.getByRole('button', { name: 'move-block-up' })
    ).not.toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'move-block-down' })
    ).toBeDisabled()
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

    render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedBlock: block1,
            selectedStep: stepWithOneBlock
          }}
        >
          <MoveBlock />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'move-block-up' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'move-block-down' })
    ).toBeDisabled()
  })
})
