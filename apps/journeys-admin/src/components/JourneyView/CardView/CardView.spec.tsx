import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { NextRouter, useRouter } from 'next/router'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { CardView } from './CardView'
import { steps, oneStep } from './data'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('JourneyView/CardView', () => {
  const journey = {
    id: 'journeyId',
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base
  } as unknown as Journey

  it('should render cards', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={journey}>
          <CardView slug="my-journey" blocks={steps} />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('5 cards in this journey')).toBeInTheDocument()
  })
  it('should render description for 1 card', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={journey}>
          <CardView slug="my-journey" blocks={oneStep} />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('1 card in this journey')).toBeInTheDocument()
  })

  it('should render description when no cards are present', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={journey}>
          <CardView slug="my-journey" blocks={[]} />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Select Empty Card to add')).toBeInTheDocument()
  })

  it('should navigate to edit page when adding new card', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={journey}>
          <CardView slug="my-journey" blocks={steps} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('preview-step0.id'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/journeys/my-journey/edit?stepId=step0.id',
        undefined,
        { shallow: true }
      )
    )
  })
})
