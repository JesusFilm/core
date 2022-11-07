import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render } from '@testing-library/react'
import { JourneyWithEvents } from '../transformVisitorEvents'
import { VisitorInfoProvider } from '../VisitorInfoProvider'
import { VisitorJourneyDrawer } from './VisitorJourneyDrawer'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('VisitorJourneyDrawer', () => {
  const journey: JourneyWithEvents = {
    id: 'journeyId',
    title: 'A Journey: There and Back Again',
    createdAt: '2022-11-02T03:20:26.368Z',
    events: []
  }

  describe('xsDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('close button closes drawer', async () => {
      const { getByTestId, getByText, queryByText } = render(
        <VisitorInfoProvider initialState={{ journey, open: true }}>
          <VisitorJourneyDrawer />
        </VisitorInfoProvider>
      )
      expect(getByText('A Journey: There and Back Again')).toBeInTheDocument()
      fireEvent.click(getByTestId('CloseIcon'))
      expect(
        queryByText('A Journey: There and Back Again')
      ).not.toBeInTheDocument()
    })
  })
})
