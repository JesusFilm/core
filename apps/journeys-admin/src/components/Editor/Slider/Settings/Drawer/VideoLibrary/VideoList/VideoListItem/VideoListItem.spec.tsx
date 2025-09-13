import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GET_VIDEO } from '../../VideoFromLocal/LocalDetails/LocalDetails'
import { videos } from '../data'

import { VideoListItem } from './VideoListItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video List Item', () => {
  it('should render the content of VideoListItem', () => {
    const { getByText } = render(
      <MockedProvider>
        <VideoListItem {...videos[0]} onSelect={jest.fn()} />
      </MockedProvider>
    )
    expect(getByText("Andreas' Story")).toBeInTheDocument()
    expect(
      getByText(
        'After living a life full of fighter planes and porsches, Andreas realizes something is missing.'
      )
    ).toBeInTheDocument()
    expect(getByText('03:06')).toBeInTheDocument()
  })

  xit('should open VideoDetails', async () => {
    // times out in jest 30
    const onSelect = jest.fn()
    const getVideoMock = {
      request: {
        query: GET_VIDEO,
        variables: {
          id: videos[0].id,
          languageId: '529'
        }
      },
      result: {
        data: {
          video: {
            id: videos[0].id,
            primaryLanguageId: '529',
            images: [
              {
                __typename: 'CloudflareImage',
                mobileCinematicHigh:
                  'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
              }
            ],
            title: [
              {
                primary: true,
                value: 'Jesus Taken Up Into Heaven'
              }
            ],
            description: [
              {
                primary: true,
                value: 'Jesus promises the Holy Spirit.'
              }
            ],
            variant: {
              id: 'variantA',
              duration: 144,
              hls: 'https://arc.gt/opsgn'
            },
            variantLanguages: [
              {
                __typename: 'Language',
                id: '529',
                name: [
                  {
                    value: 'English',
                    primary: true,
                    __typename: 'LanguageName'
                  }
                ]
              }
            ]
          }
        }
      }
    }
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getVideoMock]}>
        <VideoListItem {...videos[0]} onSelect={onSelect} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(getByText('Video Details')).toBeInTheDocument())
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).not.toBeDisabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalled()
  })
})
