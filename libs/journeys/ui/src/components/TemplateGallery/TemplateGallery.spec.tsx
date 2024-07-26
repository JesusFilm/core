import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { getTagsMock } from './data'

import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useRefinementList, useSearchBox } from 'react-instantsearch'
import { TemplateGallery } from '.'
import '../../../test/i18n'
import { useAlgoliaJourneys } from '../../libs/algolia/useAlgoliaJourneys'
import { algoliaJourneys } from '../../libs/algolia/useAlgoliaJourneys/useAlgoliaJourneys.mock'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    pathname: '/templates',
    query: { tab: 'active' }
  }))
}))

jest.mock('react-instantsearch')
jest.mock('../../libs/algolia/useAlgoliaJourneys')

describe('TemplateGallery', () => {
  beforeEach(() => {
    const useAlgoliaJourneysMocked = jest.mocked(useAlgoliaJourneys)
    useAlgoliaJourneysMocked.mockReturnValue({
      hits: algoliaJourneys,
      loading: false,
      refinements: []
    })

    const useSearchBoxMocked = jest.mocked(useSearchBox)
    useSearchBoxMocked.mockReturnValue({
      query: 'Hello World!',
      refine: jest.fn()
    } as unknown as SearchBoxRenderState)

    const useRefinementListMocked = jest.mocked(useRefinementList)
    useRefinementListMocked.mockReturnValue({
      refine: jest.fn()
    } as unknown as RefinementListRenderState)
  })

  it('should render searchbar', async () => {
    render(
      <MockedProvider mocks={[getTagsMock]}>
        <TemplateGallery />
      </MockedProvider>
    )
    const inputElement = screen.getByPlaceholderText(
      /Search by topic, occasion, or audience .../i
    )
    expect(inputElement).toBeInTheDocument()
  })

  it('should render tag carousel', async () => {
    render(
      <MockedProvider mocks={[getTagsMock]}>
        <TemplateGallery />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 6, name: 'Acceptance' })
      ).toBeInTheDocument()
    )
    expect(
      screen.getByRole('heading', { level: 6, name: 'Hope' })
    ).toBeInTheDocument()
  })

  it('should render template gallery', async () => {
    render(
      <MockedProvider mocks={[getTagsMock]}>
        <TemplateGallery />
      </MockedProvider>
    )
    expect(
      screen.getAllByRole('heading', { name: 'Featured & New' })[0]
    ).toBeInTheDocument()
  })

  // TODO: Add tests for rendering dropdown
})
