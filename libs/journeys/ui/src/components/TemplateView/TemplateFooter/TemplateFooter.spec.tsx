import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '../../../libs/JourneyProvider'

import { journey } from './data'
import { TemplateFooter } from './TemplateFooter'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const customizableJourney = { ...journey, customizable: true }
const nonCustomizableJourney = { ...journey, customizable: false }

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

  it('should show loading skeleton', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{}}>
          <TemplateFooter />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByTestId('UseThisTemplateButtonSkeleton')).toBeInTheDocument()
  })

  it('should push signed in user to customization flow page ', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: customizableJourney }}>
          <TemplateFooter signedIn />
        </JourneyProvider>
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

  it('should open copy to team dialog if journey is not customizable', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: nonCustomizableJourney }}>
          <TemplateFooter signedIn />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Use This Template' }))

    await waitFor(() => {
      expect(screen.getByTestId('CopyToTeamDialog')).toBeInTheDocument()
    })
  })
})
