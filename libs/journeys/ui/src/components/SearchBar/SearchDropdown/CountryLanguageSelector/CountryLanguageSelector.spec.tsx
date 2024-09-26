import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useRefinementList } from 'react-instantsearch'

import { SearchBarProvider } from '../../../../libs/algolia/SearchBarProvider'
import { getCountryMock } from '../../../../libs/useCountryQuery/useCountryQuery.mock'
import { languageRefinements } from '../../data'

import { CountryLanguageSelector } from './CountryLanguageSelector'

jest.mock('react-instantsearch')

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

describe('CountryLanguageSelector', () => {
  const refine = jest.fn()
  const refinements = {
    items: languageRefinements,
    refine
  } as unknown as RefinementListRenderState

  beforeEach(() => {
    mockUseRefinementList.mockReturnValue(refinements)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the country of the user', async () => {
    render(
      <SearchBarProvider>
        <MockedProvider mocks={[getCountryMock]}>
          <CountryLanguageSelector countryCode="US" refinements={refinements} />
        </MockedProvider>
      </SearchBarProvider>
    )

    await waitFor(() =>
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/_next/image?url=https%3A%2F%2Fd3s4plubcuq0w9.cloudfront.net%2Fflags%2Fpng_8%2Fflag_country_detail_us.png&w=64&q=75'
      )
    )
    expect(
      screen.getByRole('heading', { level: 6, name: 'United States:' })
    ).toBeInTheDocument()
  })

  it('should render the spoken languages of the country', async () => {
    render(
      <SearchBarProvider>
        <MockedProvider mocks={[getCountryMock]}>
          <CountryLanguageSelector countryCode="US" refinements={refinements} />
        </MockedProvider>
      </SearchBarProvider>
    )

    await waitFor(() => expect(screen.getByText('English')).toBeInTheDocument())
    expect(screen.getByText('Spanish, Latin American')).toBeInTheDocument()
  })

  it('should refine the language when clicked', async () => {
    render(
      <SearchBarProvider>
        <MockedProvider mocks={[getCountryMock]}>
          <CountryLanguageSelector countryCode="US" refinements={refinements} />
        </MockedProvider>
      </SearchBarProvider>
    )

    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'English' }))
    )
    expect(refine).toHaveBeenCalledWith('English')
  })

  it('should not render the component if there are no data for the country', async () => {
    render(
      <SearchBarProvider>
        <MockedProvider
          mocks={[
            {
              ...getCountryMock,
              result: {
                data: {
                  country: null
                }
              }
            }
          ]}
        >
          <CountryLanguageSelector refinements={refinements} />
        </MockedProvider>
      </SearchBarProvider>
    )

    expect(
      screen.queryByRole('heading', { level: 6, name: 'United States:' })
    ).not.toBeInTheDocument()
  })
})
