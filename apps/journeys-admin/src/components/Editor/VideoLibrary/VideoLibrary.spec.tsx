import { render, fireEvent, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { MockedProvider } from '@apollo/client/testing'
import { GET_VIDEOS } from './VideoFromLocal/VideoFromLocal'
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
          <VideoLibrary open />
        </MockedProvider>
      )
      expect(getByText('Video Library')).toBeInTheDocument()
      expect(getByTestId('VideoLibrary').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorRight'
      )
    })

    it('should close VideoLibrary on close Icon click', () => {
      const onClose = jest.fn()
      const { getAllByRole, getByTestId } = render(
        <MockedProvider>
          <VideoLibrary open onClose={onClose} />
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
          <VideoLibrary open />
        </MockedProvider>
      )
      expect(getByText('Video Library')).toBeInTheDocument()
      expect(getByTestId('VideoLibrary').parentElement).toHaveClass(
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
                  offset: 0,
                  limit: 5,
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
                        id: 'variantA',
                        duration: 186
                      }
                    }
                  ]
                }
              }
            }
          ]}
        >
          <VideoLibrary open />
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

  it('should render the Video Library on the right', () => {
    const { getByText, getByTestId } = render(
      <MockedProvider>
        <VideoLibrary open />
      </MockedProvider>
    )
    expect(getByText('Video Library')).toBeInTheDocument()
    expect(getByTestId('VideoLibrary').parentElement).toHaveClass(
      'MuiDrawer-paperAnchorRight'
    )
  })

  it('when video selected calls onSelect', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEOS,
              variables: {
                offset: 0,
                limit: 5,
                where: {
                  availableVariantLanguageIds: ['529'],
                  title: null
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
                      id: 'variantA',
                      duration: 186
                    }
                  }
                ]
              }
            }
          }
        ]}
      >
        <VideoLibrary open onSelect={onSelect} onClose={onClose} />
      </MockedProvider>
    )
    await waitFor(() => expect(getByText("Andreas' Story")).toBeInTheDocument())
    fireEvent.click(
      getByRole('button', {
        name: "Andreas' Story After living a life full of fighter planes and porsches, Andreas realizes something is missing. 03:06"
      })
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith({
      endAt: 0,
      startAt: 0,
      videoId: '2_0-AndreasStory',
      videoVariantLanguageId: '529'
    })
    expect(onClose).toHaveBeenCalled()
  })
})
