import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import {
  getJourneysMock,
  getJourneysMockWithAcceptanceTag,
  getJourneysMockWithoutTagsEnglish,
  getJourneysMockWithoutTagsFrench,
  getJourneysWithoutLanguageIdsMock,
  getLanguagesMock,
  getTagsMock
} from './data'

import { TemplateGallery } from '.'
import '../../../test/i18n'
import { run } from 'node:test'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import {
  InstantSearchApi,
  useInstantSearch,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'
import { useAlgoliaJourneys } from '../../libs/algolia/useAlgoliaJourneys'
import { algoliaJourneys } from '../../libs/algolia/useAlgoliaJourneys/data'

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

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

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

    const useInstantSearchMocked = jest.mocked(useInstantSearch)
    useInstantSearchMocked.mockReturnValue({
      status: 'idle'
    } as unknown as InstantSearchApi)

    const useRefinementListMocked = jest.mocked(useRefinementList)
    useRefinementListMocked.mockReturnValue({
      refine: jest.fn()
    } as unknown as RefinementListRenderState)
  })

  it('should render searchbar', async () => {
    const { getByPlaceholderText } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TemplateGallery />
      </MockedProvider>
    )
    const inputElement = getByPlaceholderText(
      /Search by topic, occasion, or audience .../i
    )
    expect(inputElement).toBeInTheDocument()
  })

  it('should render tag carousel', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TemplateGallery />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('heading', { level: 6, name: 'Acceptance' })
      ).toBeInTheDocument()
    )
    expect(getByRole('heading', { level: 6, name: 'Hope' })).toBeInTheDocument()
  })

  it('should render template gallery', async () => {
    const { getAllByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TemplateGallery />
      </MockedProvider>
    )
    expect(
      getAllByRole('heading', { name: 'Featured & New' })[0]
    ).toBeInTheDocument()
  })

  // TODO: Refactor when adding the dropdown

  // it('should render templates with multiple filtered tags', async () => {
  //   const push = jest.fn()
  //   mockedUseRouter.mockReturnValue({
  //     push,
  //     pathname: '/templates',
  //     query: { tagIds: [], languageIds: ['529'] }
  //   } as unknown as NextRouter)

  //   const { getByRole, queryByRole } = render(
  //     <MockedProvider
  //       mocks={[
  //         getTagsMock,
  //       ]}
  //     >
  //       <TemplateGallery />
  //     </MockedProvider>
  //   )
  //   fireEvent.keyDown(
  //     getByRole('combobox', {
  //       name: 'Topics, holidays, felt needs, collections'
  //     }),
  //     {
  //       key: 'ArrowDown'
  //     }
  //   )
  //   await waitFor(() =>
  //     fireEvent.click(getByRole('option', { name: 'Acceptance' }))
  //   )
  //   expect(
  //     getByRole('heading', { level: 6, name: 'Acceptance' })
  //   ).toBeInTheDocument()
  //   expect(
  //     queryByRole('heading', { level: 5, name: 'Hope' })
  //   ).not.toBeInTheDocument()
  //   expect(push).toHaveBeenCalledWith(
  //     {
  //       query: {
  //         tagIds: ['acceptanceTagId'],
  //         languageIds: ['529']
  //       }
  //     },
  //     undefined,
  //     { shallow: true }
  //   )
  // })

  // it('should render templates filtered via language ids', async () => {
  //   const push = jest.fn()
  //   const on = jest.fn()
  //   mockedUseRouter.mockReturnValue({
  //     push,
  //     pathname: '/templates',
  //     events: {
  //       on
  //     },
  //     query: { languageIds: [] }
  //   } as unknown as NextRouter)

  //   const { getByRole, getAllByRole, getByTestId } = render(
  //     <MockedProvider
  //       mocks={[
  //         getJourneysWithoutLanguageIdsMock,
  //         getJourneysMockWithoutTagsFrench,
  //         getLanguagesMock,
  //         getTagsMock
  //       ]}
  //     >
  //       <TemplateGallery />
  //     </MockedProvider>
  //   )
  //   await waitFor(() =>
  //     fireEvent.click(getAllByRole('heading', { name: 'All Languages' })[0])
  //   )

  //   fireEvent.click(getByRole('button', { name: 'French Français' }))
  //   fireEvent.click(getByTestId('PresentationLayer'))
  //   await waitFor(() => {
  //     expect(push).toHaveBeenCalledWith(
  //       {
  //         query: {
  //           languageIds: [],
  //           param: 'template-language'
  //         }
  //       },
  //       undefined,
  //       { shallow: true }
  //     )
  //   })
  // })

  // it('should render templates with a felt needs tags selected', async () => {
  //   const push = jest.fn()
  //   mockedUseRouter.mockReturnValue({
  //     push,
  //     pathname: '/templates',
  //     query: { tagIds: [], languageIds: ['529'] }
  //   } as unknown as NextRouter)

  //   const { getByRole } = render(
  //     <MockedProvider
  //       mocks={[
  //         getJourneysMockWithoutTagsEnglish,
  //         getJourneysMockWithAcceptanceTag,
  //         getLanguagesMock,
  //         getTagsMock
  //       ]}
  //     >
  //       <TemplateGallery />
  //     </MockedProvider>
  //   )

  //   await waitFor(() => {
  //     expect(
  //       getByRole('button', { name: 'Acceptance tag Acceptance Acceptance' })
  //     ).toBeInTheDocument()
  //   })

  //   fireEvent.click(
  //     getByRole('button', { name: 'Acceptance tag Acceptance Acceptance' })
  //   )
  //   await waitFor(() => {
  //     expect(push).toHaveBeenCalledWith(
  //       {
  //         query: {
  //           tagIds: 'acceptanceTagId',
  //           languageIds: ['529']
  //         }
  //       },
  //       undefined,
  //       { shallow: true }
  //     )
  //   })
  // })
})
