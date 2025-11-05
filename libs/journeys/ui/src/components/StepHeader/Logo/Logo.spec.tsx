import { fireEvent, render, screen } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '../../../libs/JourneyProvider'
import { GetJourney_journey as Journey } from '../../../libs/useJourneyQuery/__generated__/GetJourney'

import { Logo } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Logo', () => {
  it('should render logo', () => {
    const journey = {
      __typename: 'Journey',
      id: 'journeyId',
      logoImageBlock: {
        __typename: 'ImageBlock',
        src: 'https://example.com/logo.png',
        alt: 'Logo'
      }
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey }}>
        <Logo />
      </JourneyProvider>
    )

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/logo.png'
    )
  })

  it('should render a empty logo in journeys', () => {
    const journey = {
      __typename: 'Journey',
      id: 'journeyId',
      logoImageBlock: null
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey }}>
        <Logo />
      </JourneyProvider>
    )

    expect(screen.getByTestId('empty-logo')).toBeInTheDocument()
  })

  it('should render a placeholder logo in the editor', () => {
    const journey = {
      __typename: 'Journey',
      id: 'journeyId',
      logoImageBlock: null
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <Logo />
      </JourneyProvider>
    )

    expect(screen.getByTestId('DiamondIcon')).toBeInTheDocument()
  })

  it('logo should navigate back to the start of the journey', () => {
    const mockClick = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: { journeySlug: 'journeySlug' },
      push: mockClick
    } as unknown as NextRouter)

    const journey = {
      __typename: 'Journey',
      id: 'journeyId',
      logoImageBlock: {
        __typename: 'ImageBlock',
        src: 'https://example.com/logo.png',
        alt: 'Logo'
      }
    } as unknown as Journey

    render(
      <JourneyProvider value={{ journey }}>
        <Logo />
      </JourneyProvider>
    )

    fireEvent.click(screen.getByRole('img'))
    expect(mockClick).toHaveBeenCalledWith('/journeySlug')
  })
})
