import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { EditorProvider } from '@core/journeys/ui'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { steps } from '../data'
import { NavigateAction } from './NavigateAction'

describe('NavigateAction', () => {
  it('shows, disabled cards', () => {
    const selectedStep = steps[3]

    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps, selectedStep }}>
            <NavigateAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByTestId('cards-disabled-view')).toBeInTheDocument()
  })

  it('shows no next card message', () => {
    const selectedStep = steps[4]

    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps, selectedStep }}>
            <NavigateAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('No next card')).toBeInTheDocument()
  })
})
