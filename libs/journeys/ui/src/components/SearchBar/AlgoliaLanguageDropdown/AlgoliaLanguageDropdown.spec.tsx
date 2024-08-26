import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useRefinementList } from 'react-instantsearch'

import { getLanguagesContinentsMock } from '../../../libs/useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'
import { languageRefinements } from '../data'

import { AlgoliaLanguageDropdown } from './AlgoliaLanguageDropdown'

jest.mock('react-instantsearch')

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

describe('AlgoliaLanguageDropdown', () => {
  beforeEach(() => {
    mockUseRefinementList.mockReturnValue({
      items: languageRefinements,
      refine: jest.fn()
    } as unknown as RefinementListRenderState)

    jest.clearAllMocks()
  })

  it('should render all the continents with their languages', async () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <AlgoliaLanguageDropdown open />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Africa')).toBeInTheDocument()
    })
    expect(screen.getByText('Asia')).toBeInTheDocument()
    expect(screen.getByText('Europe')).toBeInTheDocument()
    expect(screen.getByText('NorthAmerica')).toBeInTheDocument()
    expect(screen.getByText('Oceania')).toBeInTheDocument()
    expect(screen.getByText('SouthAmerica')).toBeInTheDocument()
  })

  it('should call refine on language click', async () => {
    const refine = jest.fn()
    mockUseRefinementList.mockReturnValue({
      items: languageRefinements,
      refine
    } as unknown as RefinementListRenderState)

    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <AlgoliaLanguageDropdown open />
      </MockedProvider>
    )
    await waitFor(() => {
      fireEvent.click(screen.getByText('English'))
    })
    expect(refine).toHaveBeenCalled()
  })
})
