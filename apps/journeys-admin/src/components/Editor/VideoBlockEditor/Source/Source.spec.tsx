import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { GET_VIDEOS } from '../../VideoLibrary/VideoList/VideoList'
import { GET_VIDEO } from '../../VideoLibrary/VideoDetails/VideoDetails'
import { videos } from '../../VideoLibrary/VideoList/VideoListData'
import { Source } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Source', () => {
  it('calls onChange when video selected', async () => {
    const onChange = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEOS,
              variables: {
                where: {
                  availableVariantLanguageIds: ['529'],
                  title: null
                }
              }
            },
            result: {
              data: {
                videos
              }
            }
          },
          {
            request: {
              query: GET_VIDEO,
              variables: {
                id: '2_0-Brand_Video'
              }
            },
            result: {
              data: {
                video: {
                  id: '2_0-Brand_Video',
                  image:
                    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
                  primaryLanguageId: '529',
                  title: [
                    {
                      primary: true,
                      value: 'Jesus Taken Up Into Heaven'
                    }
                  ],
                  description: [
                    {
                      primary: true,
                      value:
                        'Jesus promises the Holy Spirit; then ascends into the clouds.'
                    }
                  ],
                  variant: {
                    duration: 144,
                    hls: 'https://arc.gt/opsgn'
                  }
                }
              }
            }
          }
        ]}
      >
        <Source onChange={onChange} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select a Video' }))
    await waitFor(() => expect(getByText('Brand Video')).toBeInTheDocument())
    fireEvent.click(getByText('Brand Video'))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select Video' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Select Video' }))
    expect(onChange).toHaveBeenCalledWith({
      videoId: '2_0-Brand_Video',
      videoVariantLanguageId: '529'
    })
  })
})
