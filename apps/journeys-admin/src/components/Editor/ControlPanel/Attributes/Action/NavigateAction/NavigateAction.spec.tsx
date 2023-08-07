import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { steps } from '../data'

import { NavigateAction } from './NavigateAction'

describe('NavigateAction', () => {
  it('shows disabled cards', () => {
    const selectedStep = steps[3]

    const { getByTestId, getByText } = render(
      <MockedProvider>
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
          <EditorProvider initialState={{ steps, selectedStep }}>
            <NavigateAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByTestId('cards-disabled-view')).toBeInTheDocument()
    expect(
      getByText('Default Next Step defined in the current card settings.')
    ).toBeInTheDocument()
  })
})
