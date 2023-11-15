import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'

import { CardView } from './CardView'
import { oneStep, steps } from './data'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('JourneyView/CardView', () => {
  const journey = {
    id: 'journeyId',
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    }
  } as unknown as Journey

  it('should render cards', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <CardView id="journeyId" blocks={steps} />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('5 cards in this journey')).toBeInTheDocument()
  })

  it('should render description for 1 card', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <CardView id="journeyId" blocks={oneStep} />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('1 card in this journey')).toBeInTheDocument()
  })

  it('should render description when no cards are present', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <CardView id="journeyId" blocks={[]} />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Select Empty Card to add')).toBeInTheDocument()
  })

  it('should navigate to journey edit page when adding new card', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <CardView id="journeyId" blocks={steps} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('CardItem-step0.id'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/journeys/journeyId/edit?stepId=step0.id',
        undefined,
        { shallow: true }
      )
    )
  })

  it('should navigate to publisher edit page when adding new card', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { ...journey, template: true },
            variant: 'admin'
          }}
        >
          <CardView id="journeyId" blocks={steps} isPublisher />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('CardItem-step0.id'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/publisher/journeyId/edit?stepId=step0.id',
        undefined,
        { shallow: true }
      )
    )
  })

  it('should navigate to journey social preview page when a view is selected', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <CardView id="journeyId" blocks={steps} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('NavigationCardSocial'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/journeys/journeyId/edit?view=social',
        undefined,
        { shallow: true }
      )
    )
  })
})
