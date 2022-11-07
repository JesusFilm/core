import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { VisitorInfo } from './VisitorInfo'
import { VisitorInfoProvider } from './VisitorInfoProvider'
import { getVisitorEventsMock } from './VisitorJourneyList/VisitorJourneyListData'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('VisitorInfo', () => {
  it('switches between tabs', async () => {
    const { getByText } = render(
      <VisitorInfoProvider>
        <MockedProvider mocks={[getVisitorEventsMock]}>
          <VisitorInfo id="visitorId" />
        </MockedProvider>
      </VisitorInfoProvider>
    )

    const el = getByText('Latest Journey').parentElement
      ?.parentElement as HTMLElement
    await waitFor(() =>
      expect(
        within(el).getByText('A Journey: There and Back Again')
      ).toBeInTheDocument()
    )
    expect(getByText('Lord of the Rings')).not.toBeVisible()
    fireEvent.click(getByText('Journeys'))
    expect(getByText('Lord of the Rings')).toBeVisible()
  })
})
