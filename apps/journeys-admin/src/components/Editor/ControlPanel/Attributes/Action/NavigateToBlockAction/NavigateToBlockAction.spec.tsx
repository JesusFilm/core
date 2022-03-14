import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { EditorProvider } from '@core/journeys/ui'
import { InMemoryCache } from '@apollo/client'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../libs/context'
import { steps } from '../data'
import {
  NavigateToBlockAction,
  NAVIGATE_TO_BLOCK_ACTION_UPDATE
} from './NavigateToBlockAction'

describe('NavigateToBlockAction', () => {
  it('updates the action on card click', async () => {
    const selectedBlock = steps[1].children[0].children[3]

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'ButtonBlock:button1.id' }],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'ButtonBlock:button1.id': {
        ...selectedBlock
      }
    })

    const result = jest.fn(() => ({
      data: {
        blockUpdateNavigateToBlockAction: {
          id: selectedBlock.id,
          journeyId: 'journeyId',
          gtmEventName: 'gtmEventName',
          blockId: 'step2.id'
        }
      }
    }))
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: NAVIGATE_TO_BLOCK_ACTION_UPDATE,
              variables: {
                id: selectedBlock.id,
                journeyId: 'journeyId',
                input: {
                  blockId: 'step2.id'
                }
              }
            },
            result
          }
        ]}
        cache={cache}
      >
        <JourneyProvider
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps, selectedBlock }}>
            <NavigateToBlockAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('preview-step2.id'))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['ButtonBlock:button1.id']?.action).toEqual({
      gtmEventName: 'gtmEventName',
      blockId: 'step2.id'
    })
  })
})
