import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../libs/context'
import { MoveBlockButtons, BLOCK_ORDER_UPDATE } from '.'

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
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider
            initialState={{
              steps: [step],
              selectedStep: step,
              selectedBlock: block2
            }}
          >
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
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider
            initialState={{
              steps: [step],
              selectedStep: step,
              selectedBlock: block1
            }}
          >
            <MoveBlockButtons selectedBlock={block1} selectedStep={step} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'move-block-down' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
