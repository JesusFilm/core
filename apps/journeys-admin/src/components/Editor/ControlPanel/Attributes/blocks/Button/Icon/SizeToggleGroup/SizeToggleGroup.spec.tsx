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
    expect(getByRole('button', { name: 'Md' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Lg' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Sm' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Xl' })).toBeInTheDocument()
  })
  it('should change the icon size property', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SizeToggleGroup id={'button-icon-size-id'} size={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Md' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Sm' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Sm' })).toHaveClass('Mui-selected')
    )
  })
})
