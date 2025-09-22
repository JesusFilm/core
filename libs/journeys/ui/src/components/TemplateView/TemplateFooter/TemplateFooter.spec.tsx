import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '../../../libs/JourneyProvider'

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

  it('should push signed in user to customization flow page when the template customization button is clicked', async () => {
    const { getByRole } = await render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <TemplateFooter signedIn/>
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
})
