import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { BUTTON_BLOCK_UPDATE } from './Color'
import { Color } from '.'

describe('Button color selector', () => {
  it('should show button color properties', () => {
    const { getByRole } = render(
      <MockedProvider>
        <Color id={'button-color-id'} color={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Error' })).toBeInTheDocument()
  })
  it('should change the color property', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_UPDATE,
              variables: {
                id: 'button-color-id',
                journeyId: undefined,
                input: {
                  color: 'secondary'
                }
              }
            },
            result: {
              data: {
                buttonBlockUpdate: {
                  id: 'button-color-id',
                  color: 'secondary'
                }
              }
            }
          }
        ]}
      >
        <Color id={'button-color-id'} color={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Secondary' })).toHaveClass(
        'Mui-selected'
      )
    )
  })
})
