import { render } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { VideoLibrary } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video Library', () => {
  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should render the state in drawer', () => {
      const { getByText } = render(
        <VideoLibrary
          open={true}
          onClose={() => console.log('onClose')}
          onSelect={(id: string) => console.log('videoUUID')}
        />
      )
      expect(getByText('Video Library')).toBeInTheDocument()
    })
  })
})
