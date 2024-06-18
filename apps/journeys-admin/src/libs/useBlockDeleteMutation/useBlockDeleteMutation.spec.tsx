import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../__generated__/GetJourney'
import { defaultJourney } from '../../components/Editor/data'

import { deleteBlockMock } from './useBlockDeleteMutation.mock'

import { BLOCK_DELETE, useBlockDeleteMutation } from '.'

describe('useBlockDeleteMutation', () => {
  const block: TreeBlock<TypographyBlock> = {
    id: 'typography0.id',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'block',
    variant: null,
    children: []
  }

  it('returns a function which deletes a block', async () => {
    const { result } = renderHook(() => useBlockDeleteMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[deleteBlockMock]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        expect(await result.current[0](block)).toMatchObject({
          data: {
            blockDelete: [
              {
                __typename: 'TypographyBlock',
                id: 'block1.id',
                parentOrder: 0
              }
            ]
          }
        })
      })
    })
  })

  it('returns a function which returns undefined if error', async () => {
    const emptyBlock = {} as unknown as TypographyBlock

    const { result } = renderHook(() => useBlockDeleteMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: {
                  id: undefined,
                  journeyId: undefined,
                  parentBlockId: undefined
                }
              },
              result: {
                data: {}
              }
            }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        expect(await result.current[0](emptyBlock)).toBeUndefined()
      })
    })
  })
})
