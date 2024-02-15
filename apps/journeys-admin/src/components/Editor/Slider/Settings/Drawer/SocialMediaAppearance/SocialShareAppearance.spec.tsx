import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'

import { SocialShareAppearance } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('SocialShareAppearance', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('should render SocialShareAppearance', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { status: JourneyStatus.published } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <SocialShareAppearance />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Social Image')).toBeInTheDocument()
    expect(getByText('Change')).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Title' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Description' })).toBeInTheDocument()
  })
})
