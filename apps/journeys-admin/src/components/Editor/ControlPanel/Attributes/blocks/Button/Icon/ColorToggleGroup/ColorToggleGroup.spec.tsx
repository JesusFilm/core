import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { ColorToggleGroup } from '.'

describe('Button color selector', () => {
  it('should show button color properties', () => {
    const { getByRole } = render(
      <MockedProvider>
        <ColorToggleGroup id={'button-icon-color-id'} color={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Inherit' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Error' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Action' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Disabled' })).toBeInTheDocument()
  })
  it('should change the color property', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <ColorToggleGroup id={'button-icon-color-id'} color={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    expect(getByRole('button', { name: 'Secondary' })).toHaveClass(
      'Mui-selected'
    )
  })
})
