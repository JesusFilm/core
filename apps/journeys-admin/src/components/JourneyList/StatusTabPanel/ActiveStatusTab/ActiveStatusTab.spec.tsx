import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import {
  defaultJourney,
  publishedJourney,
  oldJourney
} from '../../journeyListData'
import { ThemeProvider } from '../../../ThemeProvider'
import { StatusTab } from './StatusTab'

describe('StatusTab', () => {
  it('should render journey cards', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <StatusTab
            journeys={[defaultJourney, publishedJourney, oldJourney]}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('Default Journey Heading')).toBeInTheDocument()
    expect(getByText('Published Journey Heading')).toBeInTheDocument()
    expect(getByText('An Old Journey Heading')).toBeInTheDocument()
  })

  it('should ask users to add a new journey', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <StatusTab journeys={[]} />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('No journeys to display.')).toBeInTheDocument()
    expect(
      getByText('Create a journey, then find it here.')
    ).toBeInTheDocument()
    expect(getByRole('button')).toBeInTheDocument()
  })
})
