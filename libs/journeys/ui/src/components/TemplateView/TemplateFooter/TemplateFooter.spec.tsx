import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'

import { JourneyProvider } from '../../../libs/JourneyProvider'

import { journey } from './data'
import { TemplateFooter } from './TemplateFooter'
import { NextRouter, useRouter } from 'next/router'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TemplateFooter', () => {
  const push = jest.fn().mockResolvedValue('')
  const prefetch = jest.fn()

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      prefetch,
      push,
      query: { createNew: false }
    } as unknown as NextRouter)

    jest.clearAllMocks()
  })

  it('should render', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <TemplateFooter />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      getByRole('button', { name: 'Use This Template' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Use This Template' })
    ).not.toBeDisabled()
  })

  it('should disable when loading', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{}}>
          <TemplateFooter />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Use This Template' })).toBeDisabled()
  })

  it('should push signed in user to customization flow page when clicking template customization button while feature flag is enabled', async () => {
    const { getByRole } = await render(
      <MockedProvider>
        <FlagsProvider flags={{ journeyCustomization: true }}>
          <JourneyProvider value={{ journey }}>
            <TemplateFooter signedIn />
          </JourneyProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Use This Template' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/templates/journeyId/customize',
        undefined,
        { shallow: true }
      )
    })
  })

  it('should open legacy copy to team dialog when clicking template customization button while feature flag is disabled', async () => {
    const { getByRole } = await render(
      <MockedProvider>
        <FlagsProvider flags={{ journeyCustomization: false }}>
          <JourneyProvider value={{ journey }}>
            <TemplateFooter signedIn />
          </JourneyProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Use This Template' }))

    await waitFor(() => {
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    })
  })
})
