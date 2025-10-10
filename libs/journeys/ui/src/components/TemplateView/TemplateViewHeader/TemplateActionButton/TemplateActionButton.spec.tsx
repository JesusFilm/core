import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen } from '@testing-library/react'

import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { journey } from '../../TemplateFooter/data'
import { TemplateActionButton } from './TemplateActionButton'
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

  it('should render UseThisTemplateButton when journey is customizable and user is signed in', () => {
    mockIsJourneyCustomizable.mockReturnValue(true)

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <TemplateActionButton signedIn={signedIn} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('UseThisTemplateButton')).toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButtonSkeleton')
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('CreateJourneyButton')).not.toBeInTheDocument()
  })

  it('should render UseThisTemplateButton when journey is customizable and user is signed out', () => {
    mockIsJourneyCustomizable.mockReturnValue(true)

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <TemplateActionButton signedIn={signedOut} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('UseThisTemplateButton')).toBeInTheDocument()
    expect(
      screen.queryByTestId('UseThisTemplateButtonSkeleton')
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('CreateJourneyButton')).not.toBeInTheDocument()
  })

  it('should render CreateJourneyButton when journey is not customizable and user is signed in', () => {
    mockIsJourneyCustomizable.mockReturnValue(false)

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <TemplateActionButton signedIn={signedIn} />
        </JourneyProvider>
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

  it('should render CreateJourneyButton when journey is not customizable and user is signed out', () => {
    mockIsJourneyCustomizable.mockReturnValue(false)

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <TemplateActionButton signedIn={signedOut} />
        </JourneyProvider>
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

  it('should render CreateJourneyButton when journey is not customizable', () => {
    mockIsJourneyCustomizable.mockReturnValue(false)

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <TemplateActionButton signedIn={signedIn} />
        </JourneyProvider>
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
        <JourneyProvider value={{ journey: undefined }}>
          <TemplateActionButton signedIn={signedIn} />
        </JourneyProvider>
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
