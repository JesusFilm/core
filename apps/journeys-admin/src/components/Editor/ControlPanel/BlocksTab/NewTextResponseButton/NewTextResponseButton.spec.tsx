import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../__generated__/GetJourney'

import { TEXT_RESPONSE_BLOCK_CREATE } from './NewTextResponseButton'

import { NewTextResponseButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('NewTextResponseButton', () => {
  const request = {
    query: TEXT_RESPONSE_BLOCK_CREATE,
    variables: {
      input: {
        id: 'textResponseBlock.id',
        journeyId: 'journey.id',
        parentBlockId: 'card.id',
        submitLabel: 'Submit',
        label: 'Your answer here'
      },
      iconBlockCreateInput: {
        id: 'icon.id',
        journeyId: 'journey.id',
        parentBlockId: 'textResponseBlock.id',
        name: null
      },
      id: 'textResponseBlock.id',
      journeyId: 'journey.id',
      updateInput: {
        submitIconId: 'icon.id'
      }
    }
  }

  const result = jest.fn(() => ({
    data: {
      textResponseBlockCreate: {
        __typename: 'TextResponseBlock',
        id: 'textResponseBlock.id',
        parentBlockId: 'card.id',
        parentOrder: 0,
        label: 'Your answer here',
        submitLabel: 'Submit',
        hint: null,
        minRows: null,
        submitIconId: null,
        action: null
      },
      submitIcon: {
        __typename: 'IconBlock',
        id: 'icon.id',
        journeyId: 'journey.id',
        parentBlockId: 'textResponseBlock.id',
        parentOrder: null,
        iconName: null,
        iconColor: null,
        iconSize: null
      },
      textResponseBlockUpdate: {
        __typename: 'TextResponseBlock',
        id: 'textResponseBlock.id',
        parentBlockId: 'card.id',
        parentOrder: null,
        journeyId: 'journey.id',
        submitIconId: 'icon.id',
        submitLabel: 'Submit',
        label: 'Your answer here',
        hint: null,
        minRows: null,
        action: {
          __typename: 'NavigateToBlockAction',
          gtmEventName: 'gtmEventName',
          blockId: 'def'
        }
      }
    }
  }))

  const selectedStep: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'step.id',
    parentBlockId: null,
    parentOrder: null,
    locked: false,
    nextBlockId: null,
    children: [
      {
        id: 'card.id',
        __typename: 'CardBlock',
        parentBlockId: 'step.id',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: []
      }
    ]
  }

  it('should create a new TextResponseBlock', async () => {
    mockUuidv4.mockReturnValueOnce('textResponseBlock.id')
    mockUuidv4.mockReturnValueOnce('icon.id')

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request,
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewTextResponseButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Feedback' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update cache', async () => {
    mockUuidv4.mockReturnValueOnce('textResponseBlock.id')
    mockUuidv4.mockReturnValueOnce('icon.id')

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey.id': {
        blocks: [],
        id: 'journey.id',
        __typename: 'Journey'
      }
    })

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request,
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewTextResponseButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Feedback' }))
    await waitFor(() =>
      expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
        { __ref: 'TextResponseBlock:textResponseBlock.id' },
        { __ref: 'IconBlock:icon.id' }
      ])
    )
  })
})
