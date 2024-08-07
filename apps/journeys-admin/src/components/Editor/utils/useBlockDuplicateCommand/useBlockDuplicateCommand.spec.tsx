import { MockedProvider } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_CardBlock as CardBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../__generated__/JourneyFields'
import { selectedStep } from '../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { defaultJourney } from '../../../JourneyList/journeyListData'

import { useBlockDuplicateCommand } from './useBlockDuplicateCommand'

const block: CardBlock = {
  id: 'cardId',
  __typename: 'CardBlock',
  parentBlockId: 'stepId',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false
}
const execute = jest.fn().mockResolvedValue(block)

describe('useBlockDuplicateCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should run the execute command', async () => {
    const { result } = renderHook(() => useBlockDuplicateCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>
          <JourneyProvider
            value={{ journey: defaultJourney as unknown as JourneyFields }}
          >
            <EditorProvider
              initialState={{ selectedBlock: block as TreeBlock, selectedStep }}
            >
              {children}
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    result.current.addBlockDuplicate({
      block: {
        id: 'videoBlockId'
      } as unknown as TreeBlock,
      execute
    })
    expect(execute).toHaveBeenCalled()
  })
})
