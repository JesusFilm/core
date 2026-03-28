import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { GET_JOURNEY_BLOCK_STATS } from './BlockStatsDialog'

import { BlockStatsDialog } from '.'

const mockBlocks = [
  { __typename: 'StepBlock', id: 'step-1' },
  { __typename: 'StepBlock', id: 'step-2' },
  { __typename: 'CardBlock', id: 'card-1' },
  { __typename: 'CardBlock', id: 'card-2' },
  { __typename: 'ImageBlock', id: 'image-1' },
  { __typename: 'VideoBlock', id: 'video-1' },
  { __typename: 'TypographyBlock', id: 'typography-1' },
  { __typename: 'TypographyBlock', id: 'typography-2' },
  { __typename: 'TypographyBlock', id: 'typography-3' },
  { __typename: 'ButtonBlock', id: 'button-1' }
]

const blockStatsMock: MockedResponse = {
  request: {
    query: GET_JOURNEY_BLOCK_STATS,
    variables: { journeyId: 'journey-1' }
  },
  result: {
    data: {
      blocks: mockBlocks
    }
  }
}

describe('BlockStatsDialog', () => {
  it('renders block type rows with counts when open', async () => {
    render(
      <MockedProvider mocks={[blockStatsMock]}>
        <BlockStatsDialog
          journeyId="journey-1"
          journeyTitle="My Journey"
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Step')).toBeInTheDocument()
    })

    expect(screen.getByText('Step')).toBeInTheDocument()
    expect(screen.getByText('Card')).toBeInTheDocument()
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('shows correct counts per block type', async () => {
    const { getAllByRole } = render(
      <MockedProvider mocks={[blockStatsMock]}>
        <BlockStatsDialog
          journeyId="journey-1"
          journeyTitle="My Journey"
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Step')).toBeInTheDocument()
    })

    const listItems = getAllByRole('listitem')
    const stepItem = listItems.find((item) => item.textContent?.includes('Step'))
    const typographyItem = listItems.find((item) =>
      item.textContent?.includes('Typography')
    )

    expect(stepItem?.textContent).toContain('2')
    expect(typographyItem?.textContent).toContain('3')
  })

  it('shows total block count at the bottom', async () => {
    render(
      <MockedProvider mocks={[blockStatsMock]}>
        <BlockStatsDialog
          journeyId="journey-1"
          journeyTitle="My Journey"
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Total: 10')).toBeInTheDocument()
    })
  })

  it('uses journey title as dialog title', () => {
    render(
      <MockedProvider mocks={[]}>
        <BlockStatsDialog
          journeyId="journey-1"
          journeyTitle="My Awesome Journey"
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    expect(screen.getByText('My Awesome Journey')).toBeInTheDocument()
  })

  it('does not fire query when closed', () => {
    const result = jest.fn(() => ({ data: { blocks: [] } }))
    const mock: MockedResponse = {
      request: {
        query: GET_JOURNEY_BLOCK_STATS,
        variables: { journeyId: 'journey-1' }
      },
      result
    }

    render(
      <MockedProvider mocks={[mock]}>
        <BlockStatsDialog
          journeyId="journey-1"
          journeyTitle="My Journey"
          open={false}
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    expect(result).not.toHaveBeenCalled()
  })

  it('shows "No blocks found" when journey has no blocks', async () => {
    const emptyMock: MockedResponse = {
      request: {
        query: GET_JOURNEY_BLOCK_STATS,
        variables: { journeyId: 'journey-1' }
      },
      result: {
        data: { blocks: [] }
      }
    }

    render(
      <MockedProvider mocks={[emptyMock]}>
        <BlockStatsDialog
          journeyId="journey-1"
          journeyTitle="Empty Journey"
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No blocks found')).toBeInTheDocument()
    })
  })

  it('calls onClose when dialog is closed', () => {
    const handleClose = jest.fn()

    render(
      <MockedProvider mocks={[]}>
        <BlockStatsDialog
          journeyId="journey-1"
          journeyTitle="My Journey"
          open
          onClose={handleClose}
        />
      </MockedProvider>
    )

    const closeButton = screen.getByTestId('dialog-close-button')
    closeButton.click()

    expect(handleClose).toHaveBeenCalled()
  })
})
