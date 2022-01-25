import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../libs/context'
import { defaultJourney, publishedJourney } from '../data'
import { Menu } from './Menu'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

const MenuMock = ({ journey }: { journey: Journey }): ReactElement => {
  return (
    <MockedProvider mocks={[]}>
      <JourneyProvider value={journey}>
        <Menu />
      </JourneyProvider>
    </MockedProvider>
  )
}

describe('JourneyView/Menu', () => {
  it('should open menu on click', () => {
    const { getByRole } = render(<MenuMock journey={defaultJourney} />)

    const menu = getByRole('button')

    fireEvent.click(menu)

    expect(menu.getAttribute('aria-expanded')).toBe('true')
  })

  it('should not preview if journey is draft', () => {
    const { getByRole } = render(<MenuMock journey={defaultJourney} />)

    const menu = getByRole('button')

    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Preview' })

    expect(menuItem).toHaveAttribute('aria-disabled', 'true')
  })

  it('should preview if journey is published', () => {
    const { getByRole } = render(<MenuMock journey={publishedJourney} />)

    const menu = getByRole('button')

    fireEvent.click(menu)

    const link = getByRole('menuitem', { name: 'Preview' })

    expect(link).toHaveAttribute(
      'href',
      `http://your.nextstep.is/${publishedJourney.slug}`
    )
  })

  it('should not publish if journey is published', () => {
    const { getByRole } = render(<MenuMock journey={publishedJourney} />)

    const menu = getByRole('button')

    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Publish' })

    expect(menuItem).toHaveAttribute('aria-disabled', 'true')
  })

  it('should handle edit journey title', () => {
    const { getByRole } = render(<MenuMock journey={defaultJourney} />)

    const menu = getByRole('button')
    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Title' })
    fireEvent.click(menuItem)

    const dialog = getByRole('dialog')
    const form = getByRole('group', { name: 'dialog-update-title' })

    expect(dialog).toBeInTheDocument()
    expect(form).toBeInTheDocument()
  })
  it('should handle edit journey description', () => {
    const { getByRole } = render(<MenuMock journey={defaultJourney} />)

    const menu = getByRole('button')
    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Description' })
    fireEvent.click(menuItem)

    const dialog = getByRole('dialog')
    const form = getByRole('group', { name: 'dialog-update-description' })

    expect(dialog).toBeInTheDocument()
    expect(form).toBeInTheDocument()
  })

  it('should handle copy url', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
      <MenuMock journey={defaultJourney} />
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
