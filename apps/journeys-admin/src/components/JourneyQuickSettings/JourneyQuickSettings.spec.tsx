import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journey } from '../../libs/useHostCreate/useHostCreate.mocks'

import { JourneyQuickSettings } from './JourneyQuickSettings'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('JourneyQuickSettings', () => {
  it('should render elements', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <JourneyQuickSettings />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('OnboardingTemplateCard')).toBeInTheDocument()
    expect(screen.getByTestId('JourneyQuickSettingsTabs')).toBeInTheDocument()
    expect(screen.getByTestId('JourneyQuickSettingsChat')).toBeInTheDocument()
    expect(
      screen.queryByTestId('JourneyQuickSettingsGoals')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('PreviewItem')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('should render journeyQuickSettingsGoals on goals tab click', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <JourneyQuickSettings />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('JourneyQuickSettingsChat')).toBeInTheDocument()
    expect(
      screen.queryByTestId('JourneyQuickSettingsGoals')
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Goals' }))

    expect(screen.getByTestId('JourneyQuickSettingsGoals')).toBeInTheDocument()
    expect(
      screen.queryByTestId('JourneyQuickSettingsChat')
    ).not.toBeInTheDocument()
  })

  it('should open share dialog on share button click', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <JourneyQuickSettings />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.queryByTestId('ShareDialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByTestId('ShareDialog')).toBeInTheDocument()
  })
})
