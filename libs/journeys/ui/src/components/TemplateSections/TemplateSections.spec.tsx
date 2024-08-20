import { render, screen, waitFor } from '@testing-library/react'

import '../../../test/i18n'
import { TemplateSections } from './TemplateSections'

import { useAlgoliaJourneys } from '../../libs/algolia/useAlgoliaJourneys'
import { algoliaJourneys } from '../../libs/algolia/useAlgoliaJourneys/useAlgoliaJourneys.mock'

jest.mock('react-instantsearch')
jest.mock('../../libs/algolia/useAlgoliaJourneys')

const mockUseAlgoliaJourneys = useAlgoliaJourneys as jest.MockedFunction<
  typeof useAlgoliaJourneys
>

describe('TemplateSections', () => {
  beforeEach(() => {
    mockUseAlgoliaJourneys.mockReturnValue({
      hits: algoliaJourneys,
      loading: false,
      refinements: []
    })
  })

  describe('Featured & New Templates', () => {
    it('should render Featured & New templates', async () => {
      render(<TemplateSections />)
      expect(
        screen.getByRole('heading', { name: 'Featured & New' })
      ).toBeInTheDocument()
      expect(
        screen.getAllByRole('heading', { name: 'onboarding template3' })[0]
      ).toBeInTheDocument()
    })

    it('should getByTestId image loading for primary carousel', async () => {
      render(<TemplateSections />)
      expect(
        screen
          .getByTestId('journey-template-id-3')
          .getElementsByClassName('MuiImageBackground-root')[0]
      ).toHaveAttribute('rel', 'preload')
    })

    it('should render tag carousels if more than 5 journeys in a category', async () => {
      mockUseAlgoliaJourneys.mockReturnValue({
        hits: algoliaJourneys.concat(algoliaJourneys),
        loading: false,
        refinements: []
      })
      render(<TemplateSections />)
      expect(
        screen.getByRole('heading', { name: 'Acceptance' })
      ).toBeInTheDocument()
    })

    it('should not render tag carousels if no more than 5 journeys in a category', async () => {
      render(<TemplateSections />)
      const tagCarousels = screen.queryByRole('heading', { name: 'Acceptance' })
      expect(tagCarousels).not.toBeInTheDocument()
    })
  })

  describe('Relevant Templates', () => {
    beforeEach(() => {
      mockUseAlgoliaJourneys.mockReturnValue({
        hits: algoliaJourneys,
        loading: false,
        refinements: ['Acceptance', 'Depression']
      })
    })

    it('should render relevant templates if multiple tags are selected', async () => {
      render(<TemplateSections />)
      expect(
        screen.getAllByRole('heading', { name: 'onboarding template3' })[0]
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Most Relevant' })
      ).toBeInTheDocument()
    })
  })

  describe('Tag Templates', () => {
    beforeEach(() => {
      mockUseAlgoliaJourneys.mockReturnValue({
        hits: algoliaJourneys,
        loading: false,
        refinements: ['Addiction', 'Acceptance']
      })
    })

    it('should render tag templates', async () => {
      render(<TemplateSections />)
      await waitFor(async () => {
        expect(
          screen.getByRole('heading', { name: 'Addiction' })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('heading', { name: 'Acceptance' })
        ).toBeInTheDocument()
      })
    })
  })

  // TODO: Test for multiple languages

  describe('Empty', () => {
    beforeEach(() => {
      mockUseAlgoliaJourneys.mockReturnValue({
        hits: [],
        loading: false,
        refinements: []
      })
    })

    it('should render empty state', async () => {
      render(<TemplateSections />)
      expect(
        screen.getByRole('heading', {
          name: 'Sorry, no results'
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Try removing or changing something from your request')
      ).toBeInTheDocument()
    })

    it('should not render featured and new', async () => {
      render(<TemplateSections />)
      const featuredAndNew = screen.queryByRole('heading', {
        name: 'Featured & New'
      })
      expect(featuredAndNew).not.toBeInTheDocument()
    })
  })
})
