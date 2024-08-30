import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
// import { userEvent } from '@testing-library/user-event'
import { ResultOf, VariablesOf } from 'gql.tada'
import { NextIntlClientProvider } from 'next-intl'

import { GET_VIDEOS_AND_COUNT, VideoList } from './VideoList'

describe('VideoList', () => {
  type GetVideosAndCountResult = ResultOf<typeof GET_VIDEOS_AND_COUNT>

  type GetVideosAndCountVariables = VariablesOf<typeof GET_VIDEOS_AND_COUNT>

  const mockGetVideosAndCount: MockedResponse<
    GetVideosAndCountResult,
    GetVideosAndCountVariables
  > = {
    request: {
      query: GET_VIDEOS_AND_COUNT,
      variables: {
        limit: 50,
        offset: 0,
        showTitle: true,
        showSnippet: true,
        where: {}
      }
    },
    result: {
      data: {
        videosCount: [
          { id: 'example-id' },
          { id: 'example-id' },
          { id: 'example-id' }
        ],
        videos: [
          {
            id: 'example-id',
            snippet: [{ value: 'Example snippet', primary: true }],
            title: [{ value: 'Example title', primary: true }]
          },
          {
            id: 'example-id',
            snippet: [{ value: 'Example snippet', primary: true }],
            title: [{ value: 'Example title', primary: true }]
          },
          {
            id: 'example-id',
            snippet: [{ value: 'Example snippet', primary: true }],
            title: [{ value: 'Example title', primary: true }]
          }
        ]
      }
    }
  }

  it('should show loading icon when loading', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoList />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should show all videos', async () => {
    const result = jest.fn().mockReturnValue(mockGetVideosAndCount.result)
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[{ ...mockGetVideosAndCount, result }]}>
          <VideoList />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByText('example-id')).toHaveLength(2)
  })

  // it('should paginate all videos', async () => {
  //   const videos = Array.from({ length: 100 }, (x, z) => ({
  //     id: 'example-id',
  //     snippet: [{ value: 'Example snippet', primary: true }],
  //     title: [{ value: 'Example title', primary: true }]
  //   }))
  //   const videosCount = Array.from({ length: 100 }, (x, z) => ({
  //     id: 'example-id'
  //   }))

  //   console.log(videos)

  //   const result = jest.fn().mockReturnValue(mockGetVideosAndCount.result)
  //   render(
  //     <NextIntlClientProvider locale="en">
  //       <MockedProvider mocks={[{ ...mockGetVideosAndCount, result }]}>
  //         <VideoList />
  //       </MockedProvider>
  //     </NextIntlClientProvider>
  //   )

  //   await waitFor(() => expect(result).toHaveBeenCalled())
  //   expect(screen.getAllByText('example-id')).toHaveLength(2)
  //   await userEvent.click(
  //     screen.getByRole('button', { name: 'Go to next page' })
  //   )
  //   await waitFor(() => expect(result).toHaveBeenCalled())
  // })
})
