import { render, waitFor } from '@testing-library/react'

import '../../../test/i18n'
import { TemplateSections } from './TemplateSections'

import { useAlgoliaJourneys } from '../../libs/algolia/useAlgoliaJourneys'
import { transformedAlgoliaJourneys as journeys } from '../../libs/algolia/useAlgoliaJourneys/data'

jest.mock('react-instantsearch')
jest.mock('../../libs/algolia/useAlgoliaJourneys/useAlgoliaJourneys')

describe('TemplateSections', () => {
  beforeEach(() => {
    const useAlgoliaJourneysMocked = jest.mocked(useAlgoliaJourneys)
    useAlgoliaJourneysMocked.mockReturnValue({
      hits: journeys,
      loading: false,
      refinements: []
    })
  })

  describe('Featured & New Templates', () => {
    it('should render Featured & New templates', async () => {
      const { getByRole, getAllByRole } = render(<TemplateSections />)
      expect(
        getByRole('heading', { name: 'Featured & New' })
      ).toBeInTheDocument()
      expect(
        getAllByRole('heading', { name: 'onboarding template3' })[0]
      ).toBeInTheDocument()
    })

    it('should getByTestId image loading for primary carousel', async () => {
      const { getByTestId } = render(<TemplateSections />)
      expect(
        getByTestId(
          'journey-e978adb4-e4d8-42ef-89a9-79811f10b7e9'
        ).getElementsByClassName('MuiImageBackground-root')[0]
      ).toHaveAttribute('rel', 'preload')
    })

    it('should render tag carousels if more than 5 journeys in a category', async () => {
      const useAlgoliaJourneysMocked = jest.mocked(useAlgoliaJourneys)
      useAlgoliaJourneysMocked.mockReturnValue({
        hits: journeys.concat(journeys),
        loading: false,
        refinements: []
      })
      const { getByRole } = render(<TemplateSections />)
      expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
    })

    it('should not render tag carousels if no more than 5 journeys in a category', async () => {
      const { queryByRole } = render(<TemplateSections />)
      const tagCarousels = queryByRole('heading', { name: 'Acceptance' })
      expect(tagCarousels).not.toBeInTheDocument()
    })
  })

  describe('Relevant Templates', () => {
    beforeEach(() => {
      const useAlgoliaJourneysMocked = jest.mocked(useAlgoliaJourneys)
      useAlgoliaJourneysMocked.mockReturnValue({
        hits: journeys,
        loading: false,
        refinements: ['Acceptance', 'Depression']
      })
    })

    it('should render relevant templates if multiple tags are selected', async () => {
      const { getByRole, getAllByRole } = render(<TemplateSections />)
      expect(
        getAllByRole('heading', { name: 'onboarding template3' })[0]
      ).toBeInTheDocument()
      expect(
        getByRole('heading', { name: 'Most Relevant' })
      ).toBeInTheDocument()
    })
  })

  describe('Tag Templates', () => {
    beforeEach(() => {
      const useAlgoliaJourneysMocked = jest.mocked(useAlgoliaJourneys)
      useAlgoliaJourneysMocked.mockReturnValue({
        hits: journeys,
        loading: false,
        refinements: ['Addiction', 'Acceptance']
      })
    })

    it('should render tag templates', async () => {
      const { getByRole } = render(<TemplateSections />)
      await waitFor(async () => {
        expect(getByRole('heading', { name: 'Addiction' })).toBeInTheDocument()
        expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
      })
    })
  })

  // TODO: when we add language filters

  // describe('Multiple Languages', () => {
  //   it('should render templates if languageIds are present', async () => {
  //     const { getByRole, getAllByRole } = render(
  //       <MockedProvider mocks={[getJourneysWithLanguageIdsMock]}>
  //         <TemplateSections languageIds={['529', '5441']} />
  //       </MockedProvider>
  //     )
  //     await waitFor(() =>
  //       expect(
  //         getAllByRole('heading', { name: 'Featured Template 2' })[0]
  //       ).toBeInTheDocument()
  //     )
  //     expect(
  //       getByRole('heading', { name: 'Featured & New' })
  //     ).toBeInTheDocument()
  //     expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
  //     expect(
  //       getByRole('heading', { name: 'Template in different language' })
  //     ).toBeInTheDocument()
  //   })
  // })

  describe('Empty', () => {
    beforeEach(() => {
      const useAlgoliaJourneysMocked = jest.mocked(useAlgoliaJourneys)
      useAlgoliaJourneysMocked.mockReturnValue({
        hits: [],
        loading: false,
        refinements: []
      })
    })

    it('should render empty state', async () => {
      const { getByRole, getByText } = render(<TemplateSections />)
      expect(
        getByRole('heading', {
          name: 'No template fully matches your search criteria.'
        })
      ).toBeInTheDocument()
      expect(
        getByText(
          "Try using fewer filters or look below for templates related to the categories you've selected to search"
        )
      ).toBeInTheDocument()
    })

    it('should not render featured and new', async () => {
      const { queryByRole } = render(<TemplateSections />)
      const featuredAndNew = queryByRole('heading', { name: 'Featured & New' })
      expect(featuredAndNew).not.toBeInTheDocument()
    })
  })
})
