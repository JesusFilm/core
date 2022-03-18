import { render, fireEvent, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { MockedProvider } from '@apollo/client/testing'
import { GET_VIDEOS } from './VideoList/VideoList'
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

    it('should render the Video Library on the right', () => {
      const { getByText, getByTestId } = render(
        <MockedProvider>
          <VideoLibrary open={true} />
        </MockedProvider>
      )
      expect(getByText('Video Library')).toBeInTheDocument()
      expect(getByTestId('VideoList').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorRight'
      )
    })

    it('should close VideoLibrary on close Icon click', () => {
      const onClose = jest.fn()
      const { getAllByRole, getByTestId } = render(
        <MockedProvider>
          <VideoLibrary open={true} onClose={onClose} />
        </MockedProvider>
      )
      expect(getAllByRole('button')[0]).toContainElement(
        getByTestId('CloseIcon')
      )
      fireEvent.click(getAllByRole('button')[0])
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('xsDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render the VideoLibrary from the bottom', () => {
      const { getByText, getByTestId } = render(
        <MockedProvider>
          <VideoLibrary open={true} />
        </MockedProvider>
      )
      expect(getByText('Video Library')).toBeInTheDocument()
      expect(getByTestId('VideoList').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorBottom'
      )
    })
  })

  describe('VideoSearch', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('displays searched video', async () => {
      const { getByRole, getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {
                    availableVariantLanguageIds: ['529'],
                    title: 'Andreas'
                  }
                }
              },
              result: {
                data: {
                  videos: [
                    {
                      id: '2_0-AndreasStory',
                      image:
                        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
                      snippet: [
                        {
                          primary: true,
                          value:
                            'After living a life full of fighter planes and porsches, Andreas realizes something is missing.'
                        }
                      ],
                      title: [
                        {
                          primary: true,
                          value: "Andreas' Story"
                        }
                      ],
                      variant: {
                        duration: 186
                      }
                    }
                  ]
                }
              }
            }
          ]}
        >
          <VideoLibrary open={true} />
        </MockedProvider>
      )
      const textBox = getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: 'Andreas' }
      })
      await waitFor(() =>
        expect(getByText("Andreas' Story")).toBeInTheDocument()
      )
    })
  })
})
