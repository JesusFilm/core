import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import {
  GET_VIDEOS_AND_COUNT,
  GetVideosAndCount,
  GetVideosAndCountVariables,
  VideoList
} from './VideoList'

jest.mock('next/navigation')

describe('VideoList', () => {
  const mockGetVideosAndCount: MockedResponse<
    GetVideosAndCount,
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
        videosCount: 3,
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

    await waitFor(() =>
      expect(screen.getAllByText('example-id')).toHaveLength(3)
    )
  })

  it('should filter id column by equals operator', async () => {
    const mockGetVideosAndCountFilter = {
      ...mockGetVideosAndCount,
      request: {
        ...mockGetVideosAndCount.request,
        variables: {
          limit: 50,
          offset: 0,
          showTitle: true,
          showSnippet: true,
          where: { ids: ['some-value'] }
        }
      }
    }

    const result = jest.fn().mockReturnValue(mockGetVideosAndCount.result)
    const result2 = jest
      .fn()
      .mockReturnValue(mockGetVideosAndCountFilter.result)

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider
          mocks={[
            { ...mockGetVideosAndCount, result },
            { ...mockGetVideosAndCountFilter, result: result2 }
          ]}
        >
          <VideoList />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    // expect(screen.getAllByText('example-id')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Show filters' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Value' }), {
      target: { value: 'some-value' }
    })
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should filter title column by equals operator', async () => {
    const mockGetVideosAndCountFilter = {
      ...mockGetVideosAndCount,
      request: {
        ...mockGetVideosAndCount.request,
        variables: {
          limit: 50,
          offset: 0,
          showTitle: true,
          showSnippet: true,
          where: { title: 'some-value' }
        }
      }
    }

    const result = jest.fn().mockReturnValue(mockGetVideosAndCount.result)
    const result2 = jest
      .fn()
      .mockReturnValue(mockGetVideosAndCountFilter.result)

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider
          mocks={[
            { ...mockGetVideosAndCount, result },
            { ...mockGetVideosAndCountFilter, result: result2 }
          ]}
        >
          <VideoList />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getAllByText('example-id')).toHaveLength(3)
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show filters' }))
    const select = screen.getByRole('combobox', { name: 'Columns' })

    await fireEvent.mouseDown(select)
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'Title' }))
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Value' }), {
      target: { value: 'some-value' }
    })
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should handle hiding the title field on the server', async () => {
    const mockGetVideosCountPageOne = {
      ...mockGetVideosAndCount,
      result: {
        data: {
          videosCount: 100,
          videos: [
            {
              id: 'example-id',
              snippet: [{ value: 'Example snippet', primary: true }],
              title: [{ value: 'Example title', primary: true }]
            }
          ]
        }
      }
    }

    const mockGetVideosCountPageTwo = {
      ...mockGetVideosCountPageOne,
      request: {
        ...mockGetVideosCountPageOne.request,
        variables: {
          limit: 50,
          offset: 50,
          showTitle: false,
          showSnippet: true,
          where: {}
        }
      }
    }

    const result = jest.fn().mockReturnValue(mockGetVideosCountPageOne.result)
    const result2 = jest.fn().mockReturnValue(mockGetVideosCountPageTwo.result)

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider
          mocks={[
            { ...mockGetVideosCountPageOne, result },
            { ...mockGetVideosCountPageTwo, result: result2 }
          ]}
        >
          <VideoList />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Select columns' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Title' }))
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should handle hiding the description field on the server', async () => {
    const mockGetVideosCountPageOne = {
      ...mockGetVideosAndCount,
      result: {
        data: {
          videosCount: 100,
          videos: [
            {
              id: 'example-id',
              snippet: [{ value: 'Example snippet', primary: true }],
              title: [{ value: 'Example title', primary: true }]
            }
          ]
        }
      }
    }

    const mockGetVideosCountPageTwo = {
      ...mockGetVideosCountPageOne,
      request: {
        ...mockGetVideosCountPageOne.request,
        variables: {
          limit: 50,
          offset: 50,
          showTitle: true,
          showSnippet: false,
          where: {}
        }
      }
    }

    const result = jest.fn().mockReturnValue(mockGetVideosCountPageOne.result)
    const result2 = jest.fn().mockReturnValue(mockGetVideosCountPageTwo.result)

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider
          mocks={[
            { ...mockGetVideosCountPageOne, result },
            { ...mockGetVideosCountPageTwo, result: result2 }
          ]}
        >
          <VideoList />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Select columns' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Description' }))
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should paginate to next page', async () => {
    const mockGetVideosCountPageOne = {
      ...mockGetVideosAndCount,
      result: {
        data: {
          videosCount: 100,
          videos: [
            {
              id: 'example-id',
              snippet: [{ value: 'Example snippet', primary: true }],
              title: [{ value: 'Example title', primary: true }]
            }
          ]
        }
      }
    }

    const mockGetVideosCountPageTwo = {
      ...mockGetVideosCountPageOne,
      request: {
        query: GET_VIDEOS_AND_COUNT,
        variables: {
          limit: 50,
          offset: 50,
          showTitle: true,
          showSnippet: true,
          where: {}
        }
      },
      result: {
        data: {
          videosCount: 100,
          videos: [
            {
              id: 'example-id',
              snippet: [{ value: 'Example snippet', primary: true }],
              title: [{ value: 'Example title', primary: true }]
            }
          ]
        }
      }
    }
    const result = jest.fn().mockReturnValue(mockGetVideosCountPageOne.result)

    const result2 = jest.fn().mockReturnValue(mockGetVideosCountPageTwo.result)
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider
          mocks={[
            { ...mockGetVideosCountPageOne, result },
            { ...mockGetVideosCountPageTwo, result: result2 }
          ]}
        >
          <VideoList />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    await fireEvent.click(
      screen.getByRole('button', { name: 'Go to next page' })
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })
})
