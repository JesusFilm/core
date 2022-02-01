import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { BUTTON_BLOCK_UPDATE } from './Variant'
import { Variant } from '.'

describe('Button variant selector', () => {
  it('should show button variant properties', () => {
    const { getByRole } = render(
      <MockedProvider>
        <Variant id={'button-variant-id'} variant={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Text' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
  })
  it('should change the Variant property', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_UPDATE,
              variables: {
                id: 'button-variant-id',
                journeyId: undefined,
                input: {
                  variant: 'text'
                }
              }
            },
            result: {
              data: {
                buttonBlockUpdate: {
                  id: 'button-variant-id',
                  variant: 'text'
                }
              }
            }
          }
        ]}
      >
        <Variant id={'button-variant-id'} variant={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(getByRole('button', { name: 'Text' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Text' })).toHaveClass('Mui-selected')
    )
  })
})
