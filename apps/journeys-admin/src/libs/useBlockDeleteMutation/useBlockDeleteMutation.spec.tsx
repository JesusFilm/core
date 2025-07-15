import { MockedProvider } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../__generated__/GetJourney'

import { deleteBlockMock } from './useBlockDeleteMutation.mock'

import { useBlockDeleteMutation } from '.'

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
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    },
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
