import { render } from '@testing-library/react'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('should render input field', async () => {
    const { getByRole } = render(<SearchBar />)
    expect(getByRole('textbox')).toBeInTheDocument()
  })

  it('should have placeholder text', async () => {
    const { getByPlaceholderText } = render(<SearchBar />)
    const inputElement = getByPlaceholderText(
      /Search by topic, occasion, or audience .../i
    )
    expect(inputElement).toBeInTheDocument()
  })

  it('should have globe icon', async () => {
    const { getByTestId } = render(<SearchBar />)
    const searchIcon = getByTestId('Search1Icon')
    expect(searchIcon).toBeInTheDocument()
  })
})
