import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'

import { JourneyProvider } from '../../../libs/JourneyProvider'
import { isJourneyCustomizable } from '../../../libs/isJourneyCustomizable'

import { journey } from './data'
import { TemplateFooter } from './TemplateFooter'
import { NextRouter, useRouter } from 'next/router'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('../../../libs/isJourneyCustomizable', () => ({
  isJourneyCustomizable: jest.fn()
}))

const mockIsJourneyCustomizable = isJourneyCustomizable as jest.MockedFunction<
  typeof isJourneyCustomizable
>

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
    mockIsJourneyCustomizable.mockReturnValue(true)

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
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
    mockIsJourneyCustomizable.mockReturnValue(false)

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
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
