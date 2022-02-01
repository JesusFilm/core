import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { BUTTON_BLOCK_UPDATE } from './Size'
import { Size } from '.'

describe('Button size selector', () => {
  it('should show button size properties', () => {
    const { getByRole } = render(
      <MockedProvider>
        <Size id={'button-size-id'} size={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Small' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Large' })).toBeInTheDocument()
  })
  it('should change the size property', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_UPDATE,
              variables: {
                id: 'button-size-id',
                journeyId: undefined,
                input: {
                  size: 'small'
                }
              }
            },
            result: {
              data: {
                buttonBlockUpdate: {
                  id: 'button-size-id',
                  size: 'small'
                }
              }
            }
          }
        ]}
      >
        <Size id={'button-size-id'} size={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Small' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Small' })).toHaveClass('Mui-selected')
    )
  })
})
