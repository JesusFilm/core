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

    const feltNeedsCarousel = getByTestId('-template-gallery-carousel')
    expect(feltNeedsCarousel).toBeInTheDocument()
    expect(
      within(feltNeedsCarousel).getAllByTestId('felt-needs-button-loading')
    ).toHaveLength(8)

    expect(getAllByTestId('collections-button-loading')).toHaveLength(2)

    await waitFor(async () => {
      await expect(
        within(feltNeedsCarousel).getByRole('button', {
          name: 'Acceptance Acceptance Acceptance'
        })
      ).toBeInTheDocument()

      await expect(
        getByRole('button', {
          name: 'NUA NUA NUA'
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
      await expect(
        getByRole('button', {
          name: 'Acceptance Acceptance Acceptance'
        })
      ).toBeInTheDocument()
    })

    fireEvent.click(
      getByRole('button', {
        name: 'Acceptance Acceptance Acceptance'
      })
    )

    expect(onChange).toHaveBeenCalledWith('acceptanceTagId')
  })

  it('should filter by collections tag', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels onChange={onChange} />
      </MockedProvider>
    )

    await waitFor(async () => {
      await expect(
        getByRole('button', {
          name: 'NUA NUA NUA'
        })
      ).toBeInTheDocument()
    })

    fireEvent.click(
      getByRole('button', {
        name: 'NUA NUA NUA'
      })
    )

    expect(onChange).toHaveBeenCalledWith('nuaTagId')
  })
})
