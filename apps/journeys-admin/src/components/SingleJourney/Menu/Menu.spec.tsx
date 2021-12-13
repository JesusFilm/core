import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import Menu from './Menu'
import {
  defaultJourney,
  publishedJourney
} from '../../JourneyList/journeyListData'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('SingleJourney/Menu', () => {
  it('should open menu on click', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <Menu journey={defaultJourney} />
      </MockedProvider>
    )

    const menu = getByRole('button')

    fireEvent.click(menu)

    expect(menu.getAttribute('aria-expanded')).toBe('true')
  })

  it('should not preview if journey is draft', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <Menu journey={defaultJourney} />
      </MockedProvider>
    )

    const menu = getByRole('button')

    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Preview' })

    expect(menuItem).toHaveAttribute('aria-disabled', 'true')
  })

  it('should preview if journey is published', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <Menu journey={publishedJourney} />
      </MockedProvider>
    )

    const menu = getByRole('button')

    fireEvent.click(menu)

    const link = getByRole('link', { name: 'Preview' })

    expect(link).toHaveAttribute(
      'href',
      `http://your.nextstep.is/${publishedJourney.slug}`
    )
  })

  it('should not publish if journey is published', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <Menu journey={publishedJourney} />
      </MockedProvider>
    )

    const menu = getByRole('button')

    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Publish' })

    expect(menuItem).toHaveAttribute('aria-disabled', 'true')
  })

  it('should handle edit journey title', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <Menu journey={defaultJourney} />
      </MockedProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Title' })
    fireEvent.click(menuItem)

    const dialog = getByRole('presentation')
    const form = getByRole('group', { name: 'dialog-update-title' })

    expect(dialog).toBeInTheDocument()
    expect(form).toBeInTheDocument()
  })
  it('should handle edit journey description', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <Menu journey={defaultJourney} />
      </MockedProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Description' })
    fireEvent.click(menuItem)

    const dialog = getByRole('presentation')
    const form = getByRole('group', { name: 'dialog-update-description' })

    expect(dialog).toBeInTheDocument()
    expect(form).toBeInTheDocument()
  })

  it('should handle copy url', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
      <MockedProvider mocks={[]}>
        <Menu journey={defaultJourney} />
      </MockedProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Copy Link' })
    fireEvent.click(menuItem)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `your.nextstep.is/${defaultJourney.slug}`
    )

    await waitFor(() => {
      expect(getByText('Link Copied')).toBeInTheDocument()
    })
  })
})
