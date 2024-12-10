//

import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journey } from '../../libs/useHostCreate/useHostCreate.mocks'

import { JourneyQuickSettings } from './JourneyQuickSettings'

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
    expect(screen.getByTestId('PreviewItem')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })
  // should render goals on tab change?

  // it('should render journeyquicksettingsgoals on goals tab click', () => {
  //   render(
  //     <MockedProvider>
  //       <JourneyProvider value={{ journey, variant: 'admin' }}>
  //         <JourneyQuickSettings />
  //       </JourneyProvider>
  //     </MockedProvider>
  //   )
  // })

  // should open/close sharedialog?
})
