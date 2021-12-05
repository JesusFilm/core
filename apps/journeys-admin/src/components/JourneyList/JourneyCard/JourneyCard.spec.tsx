import { render } from '@testing-library/react'
import JourneyCard from './JourneyCard'
import {
  publishedJourney,
  defaultJourney,
  oldJourney
} from '../journeyListData'

describe('JourneyCard', () => {
  describe('published journey', () => {
    it('should render the title', () => {
      const { getAllByText } = render(
        <JourneyCard journey={publishedJourney} />
      )
      expect(getAllByText('Published Journey Heading')[0]).toBeInTheDocument()
    })

    it('should render the formatred  date', () => {
      const { getByText } = render(<JourneyCard journey={defaultJourney} />)
      expect(getByText('Nov 19th')).toBeInTheDocument()
    })

    it('should render the description with the dash', () => {
      const { getByText } = render(<JourneyCard journey={publishedJourney} />)
      expect(getByText('Nov 19th - Description')).toBeInTheDocument()
    })

    it('should render the published status', () => {
      const { getAllByText } = render(
        <JourneyCard journey={publishedJourney} />
      )
      expect(getAllByText('Published')[0]).toBeInTheDocument()
    })

    it('should render the locale captialized', () => {
      const { getAllByText } = render(
        <JourneyCard journey={publishedJourney} />
      )
      expect(getAllByText('EN (US)')[0]).toBeInTheDocument()
    })

    it('should render the formated date with year if journey is created before the current year', () => {
      const { getAllByText } = render(<JourneyCard journey={oldJourney} />)
      expect(
        getAllByText(
          'Nov 19th, 1995 - Journey created before the current year'
        )[0]
      ).toBeInTheDocument()
    })
  })
  describe('draft journey', () => {
    it('should render the draft status', () => {
      const { getAllByText } = render(<JourneyCard journey={defaultJourney} />)
      expect(getAllByText('Draft')[0]).toBeInTheDocument()
    })
  })
})
