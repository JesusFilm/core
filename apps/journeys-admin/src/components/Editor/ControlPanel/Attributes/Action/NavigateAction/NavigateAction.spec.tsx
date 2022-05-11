import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { EditorProvider, JourneyProvider } from '@core/journeys/ui'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
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
              themeName: ThemeName.base
            } as unknown as Journey
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
