import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  GET_ADMIN_VIDEOS_AND_COUNT,
  GetAdminVideosAndCount,
  GetAdminVideosAndCountVariables,
  VideoList
} from './VideoList'

jest.mock('next/navigation')

describe('VideoList', () => {
  const mockGetVideosAndCount: MockedResponse<
    GetAdminVideosAndCount,
    GetAdminVideosAndCountVariables
  > = {
    request: {
      query: GET_ADMIN_VIDEOS_AND_COUNT,
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
        adminVideosCount: 3,
        adminVideos: [
          {
            id: 'example-id',
            snippet: [{ value: 'Example snippet', primary: true }],
            title: [{ value: 'Example title', primary: true }],
            published: true,
            locked: true
          },
          {
            id: 'example-id',
            snippet: [{ value: 'Example snippet', primary: true }],
            title: [{ value: 'Example title', primary: true }],
            published: false,
            locked: false
          },
          {
            id: 'example-id',
            snippet: [{ value: 'Example snippet', primary: true }],
            title: [{ value: 'Example title', primary: true }],
            published: true,
            locked: false
          }
        ]
      }
    }
  }

  it('should show loading icon when loading', async () => {
    render(
      
        <MockedProvider>
          <VideoList />
        </MockedProvider>
      
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should show all videos', async () => {
    const result = jest.fn().mockReturnValue(mockGetVideosAndCount.result)
    render(
      
        <MockedProvider mocks={[{ ...mockGetVideosAndCount, result }]}>
          <VideoList />
        </MockedProvider>
      
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
      
        <MockedProvider
          mocks={[
            { ...mockGetVideosAndCount, result },
            { ...mockGetVideosAndCountFilter, result: result2 }
          ]}
        >
          <VideoList />
        </MockedProvider>
      
    )
    const user = userEvent.setup()

    await waitFor(() => expect(result).toHaveBeenCalled())
    // expect(screen.getAllByText('example-id')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Show filters' }))

    await user.click(screen.getByRole('combobox', { name: 'Columns' }))
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'ID' }))
    })

    await user.type(
      screen.getByRole('textbox', { name: 'Value' }),
      'some-value'
    )
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
      
        <MockedProvider
          mocks={[
            { ...mockGetVideosAndCount, result },
            { ...mockGetVideosAndCountFilter, result: result2 }
          ]}
        >
          <VideoList />
        </MockedProvider>
      
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
          adminVideosCount: 100,
          adminVideos: [
            {
              id: 'example-id',
              snippet: [{ value: 'Example snippet', primary: true }],
              title: [{ value: 'Example title', primary: true }],
              published: true,
              locked: false
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
      
        <MockedProvider
          mocks={[
            { ...mockGetVideosCountPageOne, result },
            { ...mockGetVideosCountPageTwo, result: result2 }
          ]}
        >
          <VideoList />
        </MockedProvider>
      
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
          adminVideosCount: 100,
          adminVideos: [
            {
              id: 'example-id',
              snippet: [{ value: 'Example snippet', primary: true }],
              title: [{ value: 'Example title', primary: true }],
              published: true,
              locked: false
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
      
        <MockedProvider
          mocks={[
            { ...mockGetVideosCountPageOne, result },
            { ...mockGetVideosCountPageTwo, result: result2 }
          ]}
        >
          <VideoList />
        </MockedProvider>
      
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
          adminVideosCount: 100,
          adminVideos: [
            {
              id: 'example-id',
              snippet: [{ value: 'Example snippet', primary: true }],
              title: [{ value: 'Example title', primary: true }],
              published: true,
              locked: false
            }
          ]
        }
      }
    }

    const mockGetVideosCountPageTwo = {
      ...mockGetVideosCountPageOne,
      request: {
        query: GET_ADMIN_VIDEOS_AND_COUNT,
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
          adminVideosCount: 100,
          adminVideos: [
            {
              id: 'example-id',
              snippet: [{ value: 'Example snippet', primary: true }],
              title: [{ value: 'Example title', primary: true }],
              published: true,
              locked: false
            }
          ]
        }
      }
    }
    const result = jest.fn().mockReturnValue(mockGetVideosCountPageOne.result)

    const result2 = jest.fn().mockReturnValue(mockGetVideosCountPageTwo.result)
    render(
      
        <MockedProvider
          mocks={[
            { ...mockGetVideosCountPageOne, result },
            { ...mockGetVideosCountPageTwo, result: result2 }
          ]}
        >
          <VideoList />
        </MockedProvider>
      
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    await fireEvent.click(
      screen.getByRole('button', { name: 'Go to next page' })
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })
})
