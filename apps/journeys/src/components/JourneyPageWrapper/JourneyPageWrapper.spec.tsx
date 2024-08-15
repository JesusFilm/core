import { render, screen } from '@testing-library/react'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'

import { JourneyPageWrapper } from './JourneyPageWrapper'

describe('JourneyPageWrapper', () => {
  it('renders the children', () => {
    const journey = {
      id: 'journeyId',
      themeName: ThemeName.base,
      themeMode: ThemeMode.dark
    } as unknown as Journey

    render(
      <JourneyPageWrapper journey={journey} locale="en" rtl={false}>
        <div>Test Child</div>
      </JourneyPageWrapper>
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })
})
