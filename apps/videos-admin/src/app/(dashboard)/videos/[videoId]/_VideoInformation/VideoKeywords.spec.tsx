import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VideoKeywords } from './VideoKeywords'

// Mock notistack
const mockEnqueueSnackbar = jest.fn()
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

const mockCreateKeyword = {
  request: {
    query: expect.anything(),
    variables: { value: 'new keyword', languageId: 'en' }
  },
  result: {
    data: {
      createKeyword: { id: 'new-id', value: 'new keyword' }
    }
  }
}

const initialKeywords = [
  { id: '1', value: 'alpha' },
  { id: '2', value: 'beta' }
]

describe('VideoKeywords', () => {
  afterEach(() => jest.clearAllMocks())

  it('renders initial keywords as chips', () => {
    render(
      <MockedProvider>
        <VideoKeywords
          primaryLanguageId="en"
          initialKeywords={initialKeywords}
          onChange={jest.fn()}
        />
      </MockedProvider>
    )
    expect(screen.getByText('alpha')).toBeInTheDocument()
    expect(screen.getByText('beta')).toBeInTheDocument()
  })

  it('adds a new keyword when Enter is pressed', async () => {
    const onChange = jest.fn()
    render(
      <MockedProvider mocks={[mockCreateKeyword]} addTypename={false}>
        <VideoKeywords
          primaryLanguageId="en"
          initialKeywords={[]}
          onChange={onChange}
        />
      </MockedProvider>
    )
    const input = screen.getByPlaceholderText('Add keyword')
    await userEvent.type(input, 'new keyword{enter}')
    await waitFor(() =>
      expect(screen.getByText('new keyword')).toBeInTheDocument()
    )
    expect(onChange).toHaveBeenCalledWith([
      { id: 'new-id', value: 'new keyword' }
    ])
  })

  it('prevents duplicate keywords', async () => {
    const onChange = jest.fn()
    render(
      <MockedProvider>
        <VideoKeywords
          primaryLanguageId="en"
          initialKeywords={[{ id: '1', value: 'alpha' }]}
          onChange={onChange}
        />
      </MockedProvider>
    )
    const input = screen.getByPlaceholderText('Add keyword')
    await userEvent.type(input, 'alpha{enter}')
    expect(screen.getAllByText('alpha').length).toBe(1)
  })

  it('removes a keyword when delete icon is clicked', async () => {
    const onChange = jest.fn()
    render(
      <MockedProvider>
        <VideoKeywords
          primaryLanguageId="en"
          initialKeywords={initialKeywords}
          onChange={onChange}
        />
      </MockedProvider>
    )
    const deleteButtons = screen.getAllByRole('button', { name: /close/i })
    fireEvent.click(deleteButtons[0])
    expect(onChange).toHaveBeenCalledWith([{ id: '2', value: 'beta' }])
  })

  it('shows a snackbar on mutation error', async () => {
    const errorMock = {
      request: {
        query: expect.anything(),
        variables: { value: 'fail', languageId: 'en' }
      },
      error: new Error('fail')
    }
    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <VideoKeywords
          primaryLanguageId="en"
          initialKeywords={[]}
          onChange={jest.fn()}
        />
      </MockedProvider>
    )
    const input = screen.getByPlaceholderText('Add keyword')
    await userEvent.type(input, 'fail{enter}')
    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Failed to create keyword',
        { variant: 'error' }
      )
    })
  })
})
