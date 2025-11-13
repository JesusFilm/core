import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LanguageFilterDropdown } from './LanguageFilterDropdown'

beforeAll(() => {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error - jsdom does not implement ResizeObserver
  global.ResizeObserver = MockResizeObserver
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

describe('LanguageFilterDropdown', () => {
  it('renders placeholder when no selection is provided', () => {
    render(
      <LanguageFilterDropdown
        options={[
          { value: 'english', englishName: 'English' },
          { value: 'spanish', englishName: 'Spanish' }
        ]}
        placeholder="Search languages..."
        onSelect={jest.fn()}
      />
    )

    expect(screen.getByText('Search languages...')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(
      <LanguageFilterDropdown
        loading
        loadingLabel="Loading languages..."
        onSelect={jest.fn()}
      />
    )

    expect(screen.getByText('Loading languages...')).toBeInTheDocument()
  })

  it('calls onSelect when an option is chosen', async () => {
    const onSelect = jest.fn()
    render(
      <LanguageFilterDropdown
        options={[
          { value: 'english', englishName: 'English' },
          { value: 'spanish', englishName: 'Spanish', nativeName: 'Español' }
        ]}
        placeholder="Search languages..."
        emptyLabel="No languages found."
        onSelect={onSelect}
      />
    )

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByText('Spanish'))

    expect(onSelect).toHaveBeenCalledWith('spanish')
  })
})
