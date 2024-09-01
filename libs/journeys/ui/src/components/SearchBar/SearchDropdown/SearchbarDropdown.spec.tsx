import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useRefinementList } from 'react-instantsearch'

import { getLanguagesContinentsMock } from '../../../libs/useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'
import { languageRefinements } from '../data'

import { SearchbarDropdown } from './SearchbarDropdown'

jest.mock('react-instantsearch')

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

function mockEmptyRefinementsList(): void {
  mockUseRefinementList.mockReturnValue({
    items: [],
    refine: jest.fn()
  } as unknown as RefinementListRenderState)
}

describe('SearchbarDropdown', () => {
  beforeEach(() => {
    mockUseRefinementList.mockReturnValue({
      items: languageRefinements,
      refine: jest.fn()
    } as unknown as RefinementListRenderState)

    jest.clearAllMocks()
  })

  it('should render the correct continent headers', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchbarDropdown open />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    })
    expect(screen.getByText('Asia')).toBeInTheDocument()
    expect(screen.getByText('Europe')).toBeInTheDocument()
    expect(screen.getByText('North America')).toBeInTheDocument()
    expect(screen.getByText('South America')).toBeInTheDocument()
  })

  it('should render the correct languages', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchbarDropdown open />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    })
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish, Castilian')).toBeInTheDocument()
    expect(screen.getByText('Spanish, Latin American')).toBeInTheDocument()
    expect(screen.getByText('Cantonese')).toBeInTheDocument()
    expect(screen.getByText('Chinese, Simplified')).toBeInTheDocument()
    expect(screen.getByText('Chinese, Traditional')).toBeInTheDocument()
  })

  it('should render message if no languages', async () => {
    mockEmptyRefinementsList()
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchbarDropdown open />
      </MockedProvider>
    )

    expect(
      screen.getByText(
        'Sorry, there are no languages available for this search. Try removing some of your search criteria!'
      )
    ).toBeInTheDocument()
  })

  it('should not render headers if no languages', async () => {
    mockEmptyRefinementsList()
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchbarDropdown open />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    })
    expect(screen.queryByText('Africa')).not.toBeInTheDocument()
    expect(screen.queryByText('Asia')).not.toBeInTheDocument()
    expect(screen.queryByText('Europe')).not.toBeInTheDocument()
    expect(screen.queryByText('North America')).not.toBeInTheDocument()
    expect(screen.queryByText('Oceania')).not.toBeInTheDocument()
    expect(screen.queryByText('South America')).not.toBeInTheDocument()
  })

  it('should only render continent headers that have languages', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchbarDropdown open />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    })
    expect(screen.queryByText('Africa')).not.toBeInTheDocument()
    expect(screen.queryByText('Oceania')).not.toBeInTheDocument()
  })

  it('should call refine on language click', async () => {
    const refine = jest.fn()
    mockUseRefinementList.mockReturnValue({
      items: languageRefinements,
      refine
    } as unknown as RefinementListRenderState)

    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchbarDropdown open />
      </MockedProvider>
    )
    await waitFor(() => {
      fireEvent.click(screen.getByText('English'))
    })
    expect(refine).toHaveBeenCalled()
  })

  it('should render continent refinements when languages varient', async () => {
    mockEmptyRefinementsList()
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchbarDropdown open varient="languages" />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('SearchBarDropdown')).toBeInTheDocument()
    })
  })
})
