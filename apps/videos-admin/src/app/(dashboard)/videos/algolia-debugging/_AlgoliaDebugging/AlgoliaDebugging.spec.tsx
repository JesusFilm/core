import { useApolloClient, useMutation } from '@apollo/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type MockedFunction } from 'vitest'

import { AlgoliaDebugging } from './AlgoliaDebugging'

vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useApolloClient: vi.fn(),
    useMutation: vi.fn()
  }
})

const mockEnqueueSnackbar = vi.fn()

vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  })
}))

const mockQuery = vi.fn()
const mockFixIssues = vi.fn()

const staleIssue = {
  id: 'stale:variant-stale',
  issueType: 'stale',
  variantId: 'variant-stale',
  objectId: 'variant-stale',
  videoId: 'video-1',
  languageId: '529',
  languageName: 'English',
  mismatches: [{ field: 'videoId', expected: '"video-1"', actual: '"wrong"' }],
  error: null
}

const extraIssue = {
  id: 'extra:variant-extra',
  issueType: 'extra',
  variantId: null,
  objectId: 'variant-extra',
  videoId: 'video-2',
  languageId: '496',
  languageName: 'Spanish',
  mismatches: [],
  error: null
}

function mockApolloHooks(): void {
  ;(useApolloClient as MockedFunction<typeof useApolloClient>).mockReturnValue({
    query: mockQuery
  } as any)
  ;(useMutation as MockedFunction<typeof useMutation>).mockReturnValue([
    mockFixIssues,
    { loading: false, called: false, client: {} as any, reset: vi.fn() }
  ] as any)
}

describe('AlgoliaDebugging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApolloHooks()
    mockFixIssues.mockResolvedValue({
      data: {
        fixAlgoliaVideoVariantIndexIssues: {
          fixedCount: 1,
          failedCount: 0,
          issues: []
        }
      }
    })
  })

  it('does not scan on page load', () => {
    render(<AlgoliaDebugging />)

    expect(mockQuery).not.toHaveBeenCalled()
    expect(screen.getByText('Checked 0')).toBeInTheDocument()
    expect(screen.getByText('No variant index issues')).toBeInTheDocument()
  })

  it('starts batches and accumulates issue rows and counts', async () => {
    mockQuery
      .mockResolvedValueOnce({
        data: {
          checkAlgoliaVideoVariantIndexBatch: {
            scanType: 'core',
            batchKey: null,
            nextBatchKey: null,
            done: true,
            checkedCount: 1,
            missingCount: 0,
            staleCount: 1,
            extraCount: 0,
            failedCount: 0,
            issues: [staleIssue]
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          checkAlgoliaVideoVariantIndexBatch: {
            scanType: 'algolia',
            batchKey: null,
            nextBatchKey: null,
            done: true,
            checkedCount: 1,
            missingCount: 0,
            staleCount: 0,
            extraCount: 1,
            failedCount: 0,
            issues: [extraIssue]
          }
        }
      })

    render(<AlgoliaDebugging />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Variant Check' }))

    await waitFor(() => expect(mockQuery).toHaveBeenCalledTimes(2))
    expect(screen.getByText('Checked 2')).toBeInTheDocument()
    expect(screen.getByText('Stale 1')).toBeInTheDocument()
    expect(screen.getByText('Extra 1')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Fix' })).toHaveLength(2)
    )
  })

  it('fixes one reviewed issue at a time', async () => {
    mockQuery
      .mockResolvedValueOnce({
        data: {
          checkAlgoliaVideoVariantIndexBatch: {
            scanType: 'core',
            batchKey: null,
            nextBatchKey: null,
            done: true,
            checkedCount: 1,
            missingCount: 0,
            staleCount: 1,
            extraCount: 0,
            failedCount: 0,
            issues: [staleIssue]
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          checkAlgoliaVideoVariantIndexBatch: {
            scanType: 'algolia',
            batchKey: null,
            nextBatchKey: null,
            done: true,
            checkedCount: 0,
            missingCount: 0,
            staleCount: 0,
            extraCount: 0,
            failedCount: 0,
            issues: []
          }
        }
      })

    render(<AlgoliaDebugging />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Variant Check' }))

    const fixButton = await screen.findByRole('button', { name: 'Fix' })
    fireEvent.click(fixButton)

    await waitFor(() =>
      expect(mockFixIssues).toHaveBeenCalledWith({
        variables: {
          input: { issueType: 'stale', objectIds: ['variant-stale'] }
        }
      })
    )
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Fixed 1', {
      variant: 'success'
    })
    await waitFor(() => expect(screen.getByText('Stale 0')).toBeInTheDocument())
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Fix' })
      ).not.toBeInTheDocument()
    )
  })
})
