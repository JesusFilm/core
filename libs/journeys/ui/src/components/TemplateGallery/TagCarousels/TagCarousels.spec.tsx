import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'

import { getTagsMock } from '../data'

import { TagCarousels } from '.'

describe('TagCarousels', () => {
  it('should render TagCarousels', async () => {
    const { getByTestId, getAllByTestId, getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels onChange={jest.fn()} />
      </MockedProvider>
    )

    const feltNeedsCarousel = getByTestId('felt-needs-carousel')
    expect(feltNeedsCarousel).toBeInTheDocument()
    expect(
      within(feltNeedsCarousel).getAllByTestId('felt-needs-button-loading')
    ).toHaveLength(8)

    expect(getAllByTestId('collections-button-loading')).toHaveLength(2)

    await waitFor(async () => {
      expect(
        within(feltNeedsCarousel).getByRole('button', {
          // The name of the tag is the alt text + tag label + tag label
          name: 'Acceptance tag Acceptance Acceptance'
        })
      ).toBeInTheDocument()

      expect(
        getByRole('button', {
          name: 'NUA tag NUA NUA'
        })
      ).toBeInTheDocument()
    })
  })

  it('should filter by felt needs tag', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels onChange={onChange} />
      </MockedProvider>
    )

    await waitFor(async () => {
      expect(
        getByRole('button', {
          name: 'Acceptance tag Acceptance Acceptance'
        })
      ).toBeInTheDocument()
    })

    fireEvent.click(
      getByRole('button', {
        name: 'Acceptance tag Acceptance Acceptance'
      })
    )

    expect(onChange).toHaveBeenCalledWith('acceptanceTagId')
  })

  it('should filter out felt needs tags that have no backgrounds', async () => {
    const onChange = jest.fn()
    const { getByRole, queryAllByText } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels onChange={onChange} />
      </MockedProvider>
    )

    // Not for test but needed in order to ensure rendering is correct
    await waitFor(async () => {
      expect(
        getByRole('button', {
          name: 'Acceptance tag Acceptance Acceptance'
        })
      ).toBeInTheDocument()
    })

    // Assert tags without backgrounds are filtered out
    await waitFor(async () => {
      expect(queryAllByText('Fear/Power')).toHaveLength(0)
    })
  })

  it('should filter by collections tag', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels onChange={onChange} />
      </MockedProvider>
    )

    await waitFor(async () => {
      expect(
        getByRole('button', {
          name: 'NUA tag NUA NUA'
        })
      ).toBeInTheDocument()
    })

    fireEvent.click(
      getByRole('button', {
        name: 'NUA tag NUA NUA'
      })
    )

    expect(onChange).toHaveBeenCalledWith('nuaTagId')
  })
})
