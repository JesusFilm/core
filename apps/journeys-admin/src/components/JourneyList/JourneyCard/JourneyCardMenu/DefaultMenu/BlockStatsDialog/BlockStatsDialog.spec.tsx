import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { BlockStatsDialog, GET_JOURNEY_BLOCK_STATS } from './BlockStatsDialog'

const blocks = [
  { id: 'block-1', __typename: 'StepBlock' },
  { id: 'block-2', __typename: 'CardBlock' },
  { id: 'block-3', __typename: 'CardBlock' },
  { id: 'block-4', __typename: 'TypographyBlock' },
  { id: 'block-5', __typename: 'TypographyBlock' },
  { id: 'block-6', __typename: 'TypographyBlock' },
  { id: 'block-7', __typename: 'ImageBlock' }
]

const blockStatsMock = {
  request: {
    query: GET_JOURNEY_BLOCK_STATS,
    variables: { id: 'journey-id' }
  },
  result: {
    data: {
      journey: {
        __typename: 'Journey',
        id: 'journey-id',
        blocks
      }
    }
  }
}

describe('BlockStatsDialog', () => {
  it('should render the journey title as dialog title', () => {
    const { getByText } = render(
      <MockedProvider mocks={[blockStatsMock]}>
        <BlockStatsDialog
          id="journey-id"
          title="My Journey"
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    expect(getByText('My Journey')).toBeInTheDocument()
  })

  it('should show block type counts after loading', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[blockStatsMock]}>
        <BlockStatsDialog
          id="journey-id"
          title="My Journey"
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByText('Card')).toBeInTheDocument()
      expect(getByText('Image')).toBeInTheDocument()
      expect(getByText('Step')).toBeInTheDocument()
      expect(getByText('Typography')).toBeInTheDocument()
    })

    // Card: 2, Step: 1, Typography: 3, Image: 1
    const allCounts = document.querySelectorAll('[data-testid="BlockStatsDialog"] li')
    expect(allCounts.length).toBeGreaterThan(0)
  })

  it('should show total block count', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[blockStatsMock]}>
        <BlockStatsDialog
          id="journey-id"
          title="My Journey"
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByTestId('BlockStatsTotalCount').textContent).toBe('7')
    })
  })

  it('should show loading indicator while fetching', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[blockStatsMock]}>
        <BlockStatsDialog
          id="journey-id"
          title="My Journey"
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    expect(getByTestId('BlockStatsDialogLoading')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const onClose = jest.fn()

    const { getByTestId } = render(
      <MockedProvider mocks={[blockStatsMock]}>
        <BlockStatsDialog
          id="journey-id"
          title="My Journey"
          open
          onClose={onClose}
        />
      </MockedProvider>
    )

    await userEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should not fetch when dialog is closed', () => {
    const result = jest.fn(() => ({
      data: {
        journey: {
          __typename: 'Journey',
          id: 'journey-id',
          blocks: []
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_BLOCK_STATS,
              variables: { id: 'journey-id' }
            },
            result
          }
        ]}
      >
        <BlockStatsDialog
          id="journey-id"
          title="My Journey"
          open={false}
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    expect(result).not.toHaveBeenCalled()
  })
})
