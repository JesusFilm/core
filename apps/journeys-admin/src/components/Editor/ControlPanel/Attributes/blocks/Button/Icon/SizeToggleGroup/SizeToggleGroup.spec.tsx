import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SizeToggleGroup } from '.'

describe('Button icon size selector', () => {
  it('should show icon size properties', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SizeToggleGroup id={'button-icon-size-id'} size={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Inherit' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Large' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Small' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Extra large' })).toBeInTheDocument()
  })
  it('should change the icon size property', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SizeToggleGroup id={'button-icon-size-id'} size={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Small' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Small' })).toHaveClass('Mui-selected')
    )
  })
})
