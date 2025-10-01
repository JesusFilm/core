import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { journey } from '../../TemplateFooter/data'
import { TemplateActionButton } from './TemplateActionButton'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { isJourneyCustomizable } from '../../../../libs/isJourneyCustomizable'

jest.mock('../../../../libs/isJourneyCustomizable', () => ({
  isJourneyCustomizable: jest.fn()
}))

const mockIsJourneyCustomizable = isJourneyCustomizable as jest.MockedFunction<
  typeof isJourneyCustomizable
>

describe('TemplateActionButton', () => {
  const signedIn = true
  const signedOut = false

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render UseThisTemplateButton when journey customization is enabled, journey is customizable, and user is signed in', () => {
    mockIsJourneyCustomizable.mockReturnValue(true)

    render(
      <MockedProvider>
        <FlagsProvider flags={{ journeyCustomization: true }}>
          <JourneyProvider value={{ journey }}>
            <TemplateActionButton signedIn={signedIn} />
          </JourneyProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('UseThisTemplateButton')).toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButtonSkeleton')
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('CreateJourneyButton')).not.toBeInTheDocument()
  })

  it('should render UseThisTemplateButton when journey customization is enabled, journey is customizable, and user is signed out', () => {
    mockIsJourneyCustomizable.mockReturnValue(true)

    render(
      <MockedProvider>
        <FlagsProvider flags={{ journeyCustomization: true }}>
          <JourneyProvider value={{ journey }}>
            <TemplateActionButton signedIn={signedOut} />
          </JourneyProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('UseThisTemplateButton')).toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButtonSkeleton')
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('CreateJourneyButton')).not.toBeInTheDocument()
  })

  it('should render CreateJourneyButton when journey customization is disabled and user is signed in', () => {
    mockIsJourneyCustomizable.mockReturnValue(true)

    render(
      <MockedProvider>
        <FlagsProvider flags={{ journeyCustomization: false }}>
          <JourneyProvider value={{ journey }}>
            <TemplateActionButton signedIn={signedIn} />
          </JourneyProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('CreateJourneyButton')).toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButton')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButtonSkeleton')
    ).not.toBeInTheDocument()
  })

  it('should render CreateJourneyButton when journey customization is disabled and user is signed out', () => {
    mockIsJourneyCustomizable.mockReturnValue(true)

    render(
      <MockedProvider>
        <FlagsProvider flags={{ journeyCustomization: false }}>
          <JourneyProvider value={{ journey }}>
            <TemplateActionButton signedIn={signedOut} />
          </JourneyProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('CreateJourneyButton')).toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButton')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButtonSkeleton')
    ).not.toBeInTheDocument()
  })

  it('should render CreateJourneyButton when journey is not customizable and journey customization is enabled', () => {
    mockIsJourneyCustomizable.mockReturnValue(false)

    render(
      <MockedProvider>
        <FlagsProvider flags={{ journeyCustomization: true }}>
          <JourneyProvider value={{ journey }}>
            <TemplateActionButton signedIn={signedIn} />
          </JourneyProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('CreateJourneyButton')).toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButton')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButtonSkeleton')
    ).not.toBeInTheDocument()
  })

  it('should render CreateJourneyButton when journey is not customizable and journey customization is disabled', () => {
    mockIsJourneyCustomizable.mockReturnValue(false)

    render(
      <MockedProvider>
        <FlagsProvider flags={{ journeyCustomization: false }}>
          <JourneyProvider value={{ journey }}>
            <TemplateActionButton signedIn={signedIn} />
          </JourneyProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('CreateJourneyButton')).toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButton')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButtonSkeleton')
    ).not.toBeInTheDocument()
  })

  it('should render skeleton loader when journey is undefined', () => {
    render(
      <MockedProvider>
        <FlagsProvider flags={{ journeyCustomization: true }}>
          <JourneyProvider value={{ journey: undefined }}>
            <TemplateActionButton signedIn={signedIn} />
          </JourneyProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    expect(
      screen.getByTestId('UseThisTemplateButtonSkeleton')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButton')
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('CreateJourneyButton')).not.toBeInTheDocument()
  })
})
