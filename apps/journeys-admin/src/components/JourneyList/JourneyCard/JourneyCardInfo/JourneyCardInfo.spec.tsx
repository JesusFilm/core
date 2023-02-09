import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { publishedJourney } from '../../journeyListData'
import { ThemeProvider } from '../../../ThemeProvider'
import { JourneyCardInfo } from '.'

describe('JourneyCardInfo', () => {
  it('should show the langauge name', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCardInfo journey={publishedJourney} />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })
})
