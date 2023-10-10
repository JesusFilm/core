import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { steps } from '../data'

import {
  NAVIGATE_TO_BLOCK_ACTION_UPDATE,
  NavigateToBlockAction
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
          blockId: 'step0.id'
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
                  blockId: 'step0.id'
                }
              }
            },
            result
          }
        ]}
        cache={cache}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base,
              language: {
                __typename: 'Language',
                id: '529',
                bcp47: 'en',
                iso3: 'eng'
              }
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ steps, selectedBlock }}>
            <NavigateToBlockAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('CardItem-step0.id'))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['ButtonBlock:button1.id']?.action).toEqual({
      gtmEventName: 'gtmEventName',
      blockId: 'step0.id'
    })
  })
})
