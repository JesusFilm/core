import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { publishedJourney } from '../data'

import { DatePreview } from './DatePreview'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

describe('DatePreview', () => {
  it('should have template date and the preview button', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              ...publishedJourney,
              slug: 'template-slug',
              template: true
            },
            variant: 'admin'
          }}
        >
          <DatePreview />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('November 19, 2021')).toBeInTheDocument()
    expect(getByRole('link', { name: 'Preview' })).toBeInTheDocument()
  })

  it('should open correct link in a new window', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              ...publishedJourney,
              slug: 'template-slug',
              template: true
            },
            variant: 'admin'
          }}
        >
          <DatePreview />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'Preview' })).toHaveAttribute(
      'href',
      '/api/preview?slug=template-slug'
    )
    expect(getByRole('link', { name: 'Preview' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })
})
