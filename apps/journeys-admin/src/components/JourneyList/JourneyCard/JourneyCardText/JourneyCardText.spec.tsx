import { render } from '@testing-library/react'

import {
  defaultJourney,
  fakeDate,
  publishedJourney
} from '../../journeyListData'

import { JourneyCardText } from '.'

describe('JourneyCardText', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(fakeDate))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('should show title', () => {
    const { getByText } = render(<JourneyCardText journey={publishedJourney} />)
    expect(getByText('Published Journey Heading')).toBeInTheDocument()
  })

  it('should show the langauge name', () => {
    const { getByText } = render(<JourneyCardText journey={publishedJourney} />)
    expect(getByText('English')).toBeInTheDocument()
  })

  it('should show formatted date', () => {
    const { getByText } = render(<JourneyCardText journey={defaultJourney} />)
    expect(getByText('11 months ago')).toBeInTheDocument()
  })

  it('should show translate icon', () => {
    const { getByTestId } = render(
      <JourneyCardText journey={publishedJourney} />
    )
    expect(getByTestId('TranslateIcon')).toBeInTheDocument()
  })
})
